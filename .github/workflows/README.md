# GitHub Actions Workflows

This directory contains CI/CD workflows for the Hotel SaaS application.

## Workflows Overview

### 🔨 build-and-push.yml
**Purpose:** Build Docker images and push to Google Container Registry

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Outputs:**
- `gcr.io/{project}/hotel-saas-backend:{tag}`
- `gcr.io/{project}/hotel-saas-frontend:{tag}`

**Tags:**
- `latest` (main branch)
- `develop` (develop branch)
- `pr-{number}` (pull requests)
- `{commit-sha}` (always)

---

### 🚀 deploy.yml
**Purpose:** Manual deployment to Cloud Run environments

**Triggers:** Manual workflow dispatch

**Inputs:**
- **environment**: `dev`, `staging`, or `production`
- **image_tag**: Which image to deploy (e.g., `latest`, `develop`, commit SHA)

**Steps:**
1. Deploy backend
2. Health check backend
3. Deploy frontend (connected to backend)
4. Health check frontend
5. Generate deployment summary

**Usage:**
```
Actions → Deploy to Cloud Run → Run workflow
  Environment: [production]
  Image tag: [latest]
→ Run workflow
```

---

### ⚡ auto-deploy.yml
**Purpose:** Automatic deployment on branch pushes

**Triggers:**
- Push to `develop` → Auto-deploy to `dev`
- Push to `main` → Auto-deploy to `staging`

**Steps:**
1. Build and test code
2. Build Docker images
3. Push to GCR
4. Deploy to Cloud Run
5. Run health checks
6. Generate summary

**Workflow:**
```
develop → Build → Test → Push → Deploy to dev
main    → Build → Test → Push → Deploy to staging
```

---

## Quick Reference

### Deploy to Dev
```bash
git push origin develop
# Auto-deploys to dev environment
```

### Deploy to Staging
```bash
git push origin main
# Auto-deploys to staging environment
```

### Deploy to Production
```
1. Go to GitHub Actions
2. Select "Deploy to Cloud Run"
3. Choose:
   - Environment: production
   - Image tag: latest
4. Run workflow
5. Approve (if protection enabled)
```

### Rollback
```
1. Find commit SHA to rollback to
2. Actions → Deploy to Cloud Run
3. Use that commit SHA as image tag
4. Run workflow
```

---

## Environment Configuration

| Environment | Service Name Suffix | Min Instances | Max Instances | Memory | CPU |
|-------------|---------------------|---------------|---------------|--------|-----|
| dev         | `-dev`              | 0             | 3             | 512Mi  | 1   |
| staging     | `-staging`          | 0             | 5             | 512Mi  | 1   |
| production  | (none)              | 1             | 10            | 1Gi    | 2   |

---

## Required Secrets

Set these in: `Settings → Secrets and variables → Actions`

- `GCP_PROJECT_ID` - Google Cloud Project ID
- `WIF_PROVIDER` - Workload Identity Provider resource name
- `WIF_SERVICE_ACCOUNT` - Service Account email
- `CLOUD_SQL_INSTANCE` - Cloud SQL connection name
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `GCS_BUCKET_NAME` - Google Cloud Storage bucket name

**Note:** Database password is stored in Google Secret Manager, not GitHub.

---

## Workflow Files

```
.github/workflows/
├── build-and-push.yml   # Build and push images to GCR
├── deploy.yml           # Manual deployment workflow
├── auto-deploy.yml      # Automatic deployment on push
└── README.md            # This file
```

---

## Setup Guide

See [CICD_SETUP.md](../../CICD_SETUP.md) for complete setup instructions including:
- Workload Identity Federation setup
- GitHub secrets configuration
- Environment setup
- Troubleshooting guide

---

## Monitoring

### View Workflow Runs
```
Repository → Actions tab
```

### View Deployment Summary
Each deployment creates a summary showing:
- Environment
- Deployed URLs
- Health check status
- Deployment time

### View Cloud Run Services
```bash
gcloud run services list --region=us-central1
```

---

## Best Practices

✅ **Feature Development:**
```
feature branch → PR to develop → Auto-deploy to dev
```

✅ **Staging Release:**
```
develop → merge to main → Auto-deploy to staging
```

✅ **Production Release:**
```
main → Manual deploy to production → Approval → Deploy
```

✅ **Rollback:**
```
Manual deploy → Use previous commit SHA → Deploy
```

---

## Troubleshooting

**Build fails?**
- Check Actions logs
- Run tests locally: `mvn test` / `npm test`

**Deployment fails?**
- Check Cloud Run logs
- Verify secrets are correct
- Test health endpoints

**Authentication fails?**
- Verify Workload Identity Federation setup
- Check service account permissions

See [CICD_SETUP.md](../../CICD_SETUP.md#troubleshooting) for detailed troubleshooting.

---

**Questions?** Check [CICD_SETUP.md](../../CICD_SETUP.md) for complete documentation.
