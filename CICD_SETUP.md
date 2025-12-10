# GitHub Actions CI/CD Setup

This document describes the CI/CD pipeline configuration for automated builds and deployments to Google Cloud Run.

## Overview

The CI/CD pipeline is split into three separate workflows:

1. **Build and Push** - Builds Docker images and pushes to GCR
2. **Deploy** - Manual deployment workflow with environment selection
3. **Auto Deploy** - Automatic deployment on branch pushes

## Workflows

### 1. Build and Push (`build-and-push.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**
- Runs backend tests (Maven)
- Builds backend Docker image
- Runs frontend linter
- Builds frontend Docker image
- Pushes images to Google Container Registry (GCR)
- Tags images appropriately (`latest`, `develop`, or `pr-#`)

**Image Tags:**
- `main` branch → `latest` tag
- `develop` branch → `develop` tag
- Pull requests → `pr-{number}` tag
- All builds → `{commit-sha}` tag

**Example:**
```
gcr.io/your-project/hotel-saas-backend:latest
gcr.io/your-project/hotel-saas-backend:develop
gcr.io/your-project/hotel-saas-backend:abc123def456
gcr.io/your-project/hotel-saas-backend:pr-42
```

### 2. Manual Deploy (`deploy.yml`)

**Trigger:** Manual workflow dispatch

**Inputs:**
- `environment`: Choice of `dev`, `staging`, or `production`
- `image_tag`: Which image tag to deploy (e.g., `latest`, `develop`, commit SHA)

**What it does:**
- Deploys backend to Cloud Run
- Waits for backend to be healthy
- Deploys frontend to Cloud Run (connected to backend)
- Runs health checks
- Creates deployment summary

**Environment-specific settings:**

| Setting | Dev | Staging | Production |
|---------|-----|---------|------------|
| Service name | `-dev` suffix | `-staging` suffix | Base name |
| Min instances | 0 | 0 | 1 |
| Max instances | 3 | 5 | 10 |
| Memory | 512Mi | 512Mi | 1Gi |
| CPU | 1 | 1 | 2 |

**Usage:**
1. Go to Actions tab in GitHub
2. Select "Deploy to Cloud Run"
3. Click "Run workflow"
4. Choose environment and image tag
5. Click "Run workflow"

### 3. Auto Deploy (`auto-deploy.yml`)

**Triggers:**
- Push to `develop` → Auto-deploy to `dev`
- Push to `main` → Auto-deploy to `staging`

**What it does:**
- Builds and tests code
- Builds Docker images
- Pushes to GCR
- Automatically deploys to appropriate environment
- Runs health checks
- Creates deployment summary

**Workflow:**
```
develop branch → Build → Test → Push → Deploy to dev
main branch    → Build → Test → Push → Deploy to staging
```

## Setup Instructions

### 1. Configure GitHub Secrets

Required secrets in your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required Secrets:**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | `hotel-saas-prod` |
| `WIF_PROVIDER` | Workload Identity Provider | `projects/123/locations/global/workloadIdentityPools/github/providers/github-provider` |
| `WIF_SERVICE_ACCOUNT` | Service Account email | `github-actions@hotel-saas-prod.iam.gserviceaccount.com` |
| `CLOUD_SQL_INSTANCE` | Cloud SQL connection name | `hotel-saas-prod:us-central1:hotel-saas-db` |
| `DB_NAME` | Database name | `hotelsaas` |
| `DB_USER` | Database username | `postgres` |
| `GCS_BUCKET_NAME` | GCS bucket name | `hotel-saas-images` |

**Note:** `DB_PASSWORD` should be stored in Google Secret Manager, not GitHub Secrets.

### 2. Set Up Workload Identity Federation

Workload Identity Federation allows GitHub Actions to authenticate to GCP without service account keys.

#### Step 1: Create Workload Identity Pool

```bash
export PROJECT_ID="your-project-id"
export POOL_NAME="github"
export PROVIDER_NAME="github-provider"

# Create the pool
gcloud iam workload-identity-pools create $POOL_NAME \
    --project=$PROJECT_ID \
    --location=global \
    --display-name="GitHub Actions Pool"

# Get pool ID
export POOL_ID=$(gcloud iam workload-identity-pools describe $POOL_NAME \
    --project=$PROJECT_ID \
    --location=global \
    --format="value(name)")
```

#### Step 2: Create Provider

```bash
# Create the provider
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=$POOL_NAME \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"

# Get provider resource name
export PROVIDER_ID=$(gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=$POOL_NAME \
    --format="value(name)")

echo "WIF_PROVIDER: $PROVIDER_ID"
```

#### Step 3: Create Service Account

```bash
export SA_NAME="github-actions"
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create service account
gcloud iam service-accounts create $SA_NAME \
    --project=$PROJECT_ID \
    --display-name="GitHub Actions Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

echo "WIF_SERVICE_ACCOUNT: $SA_EMAIL"
```

#### Step 4: Allow GitHub to Impersonate Service Account

```bash
export REPO="your-github-username/your-repo-name"

# Bind the service account to the pool
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
    --project=$PROJECT_ID \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/${REPO}"
```

#### Step 5: Add Secrets to GitHub

Add the values from above to your GitHub repository secrets:
- `WIF_PROVIDER`: The full provider resource name
- `WIF_SERVICE_ACCOUNT`: The service account email

### 3. Configure GitHub Environments

Set up environments for deployment protection:

```
Settings → Environments → New environment
```

Create three environments:
1. **dev** - No protection rules
2. **staging** - Optional: Require approval
3. **production** - Require approval from maintainers

For each environment, you can add:
- Environment secrets (if different from repo secrets)
- Protection rules
- Deployment branches

### 4. Set Up Secret Manager

Store database password in Google Secret Manager:

```bash
# Create secret
echo -n "your-database-password" | gcloud secrets create db-password \
    --project=$PROJECT_ID \
    --replication-policy="automatic" \
    --data-file=-

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding db-password \
    --project=$PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"
```

## Usage Examples

### Scenario 1: Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub (triggers build-and-push.yml)
git push origin feature/new-feature

# Create PR to develop (triggers build-and-push.yml with pr-# tag)
# Images built: gcr.io/project/hotel-saas-backend:pr-123
```

### Scenario 2: Deploy to Dev

**Option A: Automatic (recommended)**
```bash
# Merge PR to develop branch
git checkout develop
git merge feature/new-feature
git push origin develop

# Auto-deploy workflow runs automatically
# Deploys to: hotel-saas-backend-dev
```

**Option B: Manual**
1. Go to Actions → Deploy to Cloud Run
2. Select environment: `dev`
3. Select image tag: `develop` or specific commit SHA
4. Run workflow

### Scenario 3: Deploy to Staging

```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main

# Auto-deploy workflow runs automatically
# Deploys to: hotel-saas-backend-staging
```

### Scenario 4: Deploy to Production

**Manual deployment only (recommended for production):**

1. Go to Actions → Deploy to Cloud Run
2. Select environment: `production`
3. Select image tag: `latest` (from main branch)
4. Run workflow
5. Approve deployment (if protection rules enabled)

### Scenario 5: Rollback

Deploy a previous version:

1. Find the commit SHA you want to rollback to
2. Go to Actions → Deploy to Cloud Run
3. Select environment (e.g., `production`)
4. Enter the commit SHA as image tag
5. Run workflow

## Workflow Permissions

The workflows use Workload Identity Federation with these permissions:

- `contents: read` - Read repository contents
- `id-token: write` - Generate OIDC tokens for GCP authentication

No long-lived service account keys are stored in GitHub.

## Monitoring Deployments

### View Deployment Status

1. **GitHub Actions tab**: See all workflow runs
2. **Deployment Summary**: Each deployment creates a summary with URLs
3. **Cloud Run Console**: View service details and logs

### Check Deployment History

```bash
# List recent revisions
gcloud run revisions list \
    --service=hotel-saas-backend \
    --region=us-central1

# Get deployment annotations
gcloud run services describe hotel-saas-backend \
    --region=us-central1 \
    --format="value(metadata.annotations)"
```

### View Logs

```bash
# GitHub Actions logs
# Go to Actions → Select workflow → Select run

# Cloud Run logs
gcloud run logs tail hotel-saas-backend --region=us-central1

# Or in Cloud Console
https://console.cloud.google.com/run/detail/us-central1/hotel-saas-backend/logs
```

## Troubleshooting

### Build Fails

**Backend build fails:**
```bash
# Run tests locally
cd backend
mvn clean test

# Check logs in GitHub Actions
```

**Frontend build fails:**
```bash
# Run build locally
cd frontend
npm ci
npm run build

# Check logs in GitHub Actions
```

### Authentication Fails

**Error: "Unable to authenticate"**

Check:
1. WIF_PROVIDER secret is correct
2. WIF_SERVICE_ACCOUNT secret is correct
3. Service account has necessary roles
4. Workload Identity binding is correct

```bash
# Verify binding
gcloud iam service-accounts get-iam-policy $SA_EMAIL
```

### Deployment Fails

**Error: "Cloud SQL connection failed"**

Check:
- CLOUD_SQL_INSTANCE secret is correct
- Cloud Run has Cloud SQL connection configured
- Database credentials are correct in Secret Manager

**Error: "Health check failed"**

Check:
- Backend is starting correctly (view Cloud Run logs)
- `/actuator/health` endpoint is accessible
- Database connection is working

### Image Not Found

**Error: "Image not found in GCR"**

Check:
1. Build workflow completed successfully
2. Image was pushed to GCR
3. Image tag is correct

```bash
# List images in GCR
gcloud container images list --repository=gcr.io/$PROJECT_ID

# List tags for an image
gcloud container images list-tags gcr.io/$PROJECT_ID/hotel-saas-backend
```

## Best Practices

### Branch Strategy

```
feature/* → develop → main → production
    ↓          ↓        ↓
   Build      Dev   Staging  (auto)
                              ↓
                         Production (manual)
```

### Image Tags

- Use `latest` for production deployments from main
- Use `develop` for dev deployments
- Use commit SHA for specific version deployments
- Use `pr-#` for testing pull requests

### Deployment Safety

1. **Always deploy to dev first**
2. **Test in staging before production**
3. **Use manual deployment for production**
4. **Enable environment protection rules**
5. **Keep rollback option available**

### Monitoring

1. Set up alerts for deployment failures
2. Monitor Cloud Run metrics
3. Check logs regularly
4. Use Cloud Trace for performance monitoring

## Cost Optimization

- Dev and staging scale to zero when idle
- Production keeps minimum 1 instance for availability
- Images are cached in GCR
- Use Cloud Build free tier (120 build-minutes/day)

## Security Considerations

1. ✅ **No service account keys** - Uses Workload Identity Federation
2. ✅ **Secrets in Secret Manager** - Not in environment variables
3. ✅ **Environment protection** - Approval required for production
4. ✅ **Minimal permissions** - Service account has only needed roles
5. ✅ **Audit trail** - All deployments logged in GitHub

## Next Steps

1. Set up Cloud Monitoring alerts
2. Configure custom domains
3. Add database migration workflow
4. Set up integration tests
5. Add performance testing
6. Configure CDN for static assets

## Support

For issues:
- Check GitHub Actions logs
- Review Cloud Run logs
- Consult [DEPLOYMENT.md](DEPLOYMENT.md) for GCP setup
- Check [GCP Status](https://status.cloud.google.com/)

---

**Last Updated:** 2025-12-10
