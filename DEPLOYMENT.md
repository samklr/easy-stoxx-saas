# Production Deployment Guide - Google Cloud Run + Cloud SQL

This guide walks you through deploying the Hotel SaaS MVP to Google Cloud Platform using Cloud Run and Cloud SQL.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [Cloud SQL Database Setup](#cloud-sql-database-setup)
4. [Google Cloud Storage Setup](#google-cloud-storage-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- **Google Cloud SDK (gcloud CLI)**: [Install Guide](https://cloud.google.com/sdk/docs/install)
- **Docker**: [Install Guide](https://docs.docker.com/get-docker/)
- **Java 21** (for local development)
- **Node.js 20+** (for local development)

### Google Cloud Account
- A GCP account with billing enabled
- Necessary IAM permissions (Project Editor or Owner role)

## Google Cloud Setup

### 1. Create a New Project

```bash
# Set your project ID
export GCP_PROJECT_ID="hotel-saas-prod"
export GCP_REGION="us-central1"

# Create the project
gcloud projects create $GCP_PROJECT_ID --name="Hotel SaaS Production"

# Set the project as default
gcloud config set project $GCP_PROJECT_ID

# Link billing account (replace with your billing account ID)
gcloud billing projects link $GCP_PROJECT_ID --billing-account=XXXXXX-XXXXXX-XXXXXX
```

### 2. Enable Required APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com \
    compute.googleapis.com
```

## Cloud SQL Database Setup

### 1. Create Cloud SQL PostgreSQL Instance

```bash
# Set database configuration
export DB_INSTANCE_NAME="hotel-saas-db"
export DB_NAME="hotelsaas"
export DB_USER="postgres"
export DB_PASSWORD="your-secure-password-here"  # Change this!

# Create Cloud SQL instance (takes 5-10 minutes)
gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$GCP_REGION \
    --root-password=$DB_PASSWORD \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase \
    --backup-start-time=03:00 \
    --enable-bin-log \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04

# Create the database
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME

# Get the instance connection name
export CLOUD_SQL_INSTANCE=$(gcloud sql instances describe $DB_INSTANCE_NAME --format='value(connectionName)')
echo "Cloud SQL Instance Connection: $CLOUD_SQL_INSTANCE"
```

### 2. (Optional) Create Database User

```bash
# Create a dedicated user for the application
gcloud sql users create hotelapp \
    --instance=$DB_INSTANCE_NAME \
    --password=another-secure-password
```

### 3. Initialize Database Schema

Option A: Let Spring Boot create tables automatically (development)
- The application will create tables on first run with `ddl-auto: update`

Option B: Run manual migrations (recommended for production)

```bash
# Connect to Cloud SQL from local machine
gcloud sql connect $DB_INSTANCE_NAME --user=postgres --quiet

# Run your SQL migration scripts
# (You can also use Flyway or Liquibase for migrations)
```

## Google Cloud Storage Setup

### 1. Create GCS Bucket for Images

```bash
export GCS_BUCKET_NAME="hotel-saas-images-${GCP_PROJECT_ID}"

# Create the bucket
gsutil mb -p $GCP_PROJECT_ID -c STANDARD -l $GCP_REGION gs://$GCS_BUCKET_NAME/

# Set bucket to be publicly readable (for serving images)
gsutil iam ch allUsers:objectViewer gs://$GCS_BUCKET_NAME

# Enable versioning (optional but recommended)
gsutil versioning set on gs://$GCS_BUCKET_NAME/

# Set lifecycle policy to delete old versions after 30 days
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 3,
          "isLive": false
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://$GCS_BUCKET_NAME/
rm lifecycle.json
```

### 2. Configure CORS for GCS (if needed)

```bash
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://$GCS_BUCKET_NAME/
rm cors.json
```

## Backend Deployment

### 1. Configure Environment Variables

```bash
# Export all required environment variables
export GCP_PROJECT_ID="hotel-saas-prod"
export GCP_REGION="us-central1"
export CLOUD_SQL_INSTANCE="hotel-saas-prod:us-central1:hotel-saas-db"
export DB_NAME="hotelsaas"
export DB_USER="postgres"
export DB_PASSWORD="your-secure-password-here"
export GCS_BUCKET_NAME="hotel-saas-images-hotel-saas-prod"
```

### 2. Deploy Backend

```bash
# Run the deployment script
./deploy-backend.sh

# Or manually:
cd backend

# Build and push Docker image
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/hotel-saas-backend

# Deploy to Cloud Run
gcloud run deploy hotel-saas-backend \
    --image gcr.io/$GCP_PROJECT_ID/hotel-saas-backend \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances $CLOUD_SQL_INSTANCE \
    --set-env-vars "SPRING_PROFILES_ACTIVE=prod" \
    --set-env-vars "CLOUD_SQL_INSTANCE=$CLOUD_SQL_INSTANCE" \
    --set-env-vars "DB_NAME=$DB_NAME" \
    --set-env-vars "DB_USER=$DB_USER" \
    --set-env-vars "DB_PASSWORD=$DB_PASSWORD" \
    --set-env-vars "GCS_PROJECT_ID=$GCP_PROJECT_ID" \
    --set-env-vars "GCS_BUCKET_NAME=$GCS_BUCKET_NAME" \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300 \
    --port 8080
```

### 3. Get Backend URL

```bash
export BACKEND_URL=$(gcloud run services describe hotel-saas-backend --region $GCP_REGION --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"

# Test health endpoint
curl $BACKEND_URL/actuator/health
```

## Frontend Deployment

### 1. Configure Frontend Environment

```bash
# Set backend URL (from previous step)
export BACKEND_URL="https://hotel-saas-backend-xxxxx-uc.a.run.app"
```

### 2. Deploy Frontend

```bash
# Run the deployment script
./deploy-frontend.sh

# Or manually:
cd frontend

# Build and push Docker image
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/hotel-saas-frontend

# Deploy to Cloud Run
gcloud run deploy hotel-saas-frontend \
    --image gcr.io/$GCP_PROJECT_ID/hotel-saas-frontend \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL" \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300 \
    --port 3000
```

### 3. Get Frontend URL

```bash
export FRONTEND_URL=$(gcloud run services describe hotel-saas-frontend --region $GCP_REGION --format 'value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

## Post-Deployment Configuration

### 1. Update CORS Configuration

Update [CorsConfig.java](backend/src/main/java/com/hotelsaas/backend/config/CorsConfig.java):

```java
configuration.setAllowedOrigins(Arrays.asList(
    "https://your-frontend-url.run.app",  // Add your actual frontend URL
    "https://yourdomain.com"  // Add your custom domain
));
```

Redeploy backend after updating CORS.

### 2. Configure Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
    --service hotel-saas-frontend \
    --domain app.yourdomain.com \
    --region $GCP_REGION

# Follow instructions to update DNS records
```

### 3. Set Up SSL Certificate (Automatic with Cloud Run)

Cloud Run automatically provisions and manages SSL certificates for custom domains.

### 4. Configure Secrets (Alternative to Environment Variables)

For better security, use Secret Manager instead of environment variables:

```bash
# Create secret for database password
echo -n "$DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Grant Cloud Run access to secret
gcloud secrets add-iam-policy-binding db-password \
    --member=serviceAccount:$(gcloud run services describe hotel-saas-backend --region=$GCP_REGION --format='value(spec.template.spec.serviceAccountName)') \
    --role=roles/secretmanager.secretAccessor

# Update Cloud Run to use secret
gcloud run services update hotel-saas-backend \
    --region $GCP_REGION \
    --update-secrets=DB_PASSWORD=db-password:latest
```

## Monitoring and Maintenance

### 1. View Logs

```bash
# Backend logs
gcloud run logs read hotel-saas-backend --region $GCP_REGION --limit 50

# Frontend logs
gcloud run logs read hotel-saas-frontend --region $GCP_REGION --limit 50

# Stream logs in real-time
gcloud run logs tail hotel-saas-backend --region $GCP_REGION
```

### 2. Monitor Performance

```bash
# Open Cloud Console monitoring
gcloud run services describe hotel-saas-backend --region $GCP_REGION

# View in browser
echo "https://console.cloud.google.com/run/detail/$GCP_REGION/hotel-saas-backend/metrics?project=$GCP_PROJECT_ID"
```

### 3. Database Backups

Cloud SQL automatically creates backups. To create manual backup:

```bash
gcloud sql backups create --instance=$DB_INSTANCE_NAME
```

### 4. Cost Monitoring

```bash
# View current month's costs
gcloud billing accounts list

# Set up budget alerts in Cloud Console
echo "https://console.cloud.google.com/billing/budgets?project=$GCP_PROJECT_ID"
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Symptom**: Backend health check fails, logs show connection errors

**Solutions**:
```bash
# Verify Cloud SQL instance is running
gcloud sql instances describe $DB_INSTANCE_NAME

# Check Cloud Run has Cloud SQL connection
gcloud run services describe hotel-saas-backend --region $GCP_REGION --format='value(spec.template.spec.containers[0].resources.limits)'

# Verify environment variables
gcloud run services describe hotel-saas-backend --region $GCP_REGION --format='value(spec.template.spec.containers[0].env)'
```

#### 2. Frontend Can't Connect to Backend

**Symptom**: Frontend loads but API calls fail

**Solutions**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS configuration in backend
- Ensure backend service is `--allow-unauthenticated`

```bash
# Check frontend environment variables
gcloud run services describe hotel-saas-frontend --region $GCP_REGION --format='value(spec.template.spec.containers[0].env)'

# Test backend directly
curl $BACKEND_URL/actuator/health
```

#### 3. Image Upload Fails

**Symptom**: Cannot upload images to GCS

**Solutions**:
```bash
# Verify bucket exists
gsutil ls -b gs://$GCS_BUCKET_NAME

# Check bucket permissions
gsutil iam get gs://$GCS_BUCKET_NAME

# Test upload manually
echo "test" > test.txt
gsutil cp test.txt gs://$GCS_BUCKET_NAME/
gsutil rm gs://$GCS_BUCKET_NAME/test.txt
rm test.txt
```

#### 4. Out of Memory Errors

**Symptom**: Services crash or restart frequently

**Solutions**:
```bash
# Increase memory allocation
gcloud run services update hotel-saas-backend \
    --region $GCP_REGION \
    --memory 1Gi

# Or adjust JVM heap settings in Dockerfile
```

### View Service Details

```bash
# Get all service information
gcloud run services describe hotel-saas-backend --region $GCP_REGION

# Check recent revisions
gcloud run revisions list --service hotel-saas-backend --region $GCP_REGION

# Rollback to previous revision if needed
gcloud run services update-traffic hotel-saas-backend \
    --region $GCP_REGION \
    --to-revisions REVISION_NAME=100
```

## Estimated Costs

### Development/Testing (Low Traffic)
- **Cloud Run**: ~$0 - $10/month (generous free tier)
- **Cloud SQL (db-f1-micro)**: ~$10 - $15/month
- **Cloud Storage**: ~$0.01/GB/month
- **Total**: ~$10 - $25/month

### Production (Moderate Traffic)
- **Cloud Run**: ~$20 - $100/month
- **Cloud SQL (db-g1-small)**: ~$25 - $50/month
- **Cloud Storage**: ~$0.50 - $5/month
- **Cloud Build**: ~$0 (120 build-minutes/day free)
- **Total**: ~$50 - $200/month

## Security Best Practices

1. **Use Secret Manager** for sensitive data
2. **Enable VPC** for database isolation
3. **Set up IAM** with least-privilege access
4. **Enable Cloud Armor** for DDoS protection
5. **Implement rate limiting** in your application
6. **Regular security audits** using Security Command Center
7. **Enable audit logs** for compliance

## Next Steps

1. Set up CI/CD pipeline with Cloud Build
2. Configure monitoring and alerting
3. Implement database migration strategy (Flyway/Liquibase)
4. Set up staging environment
5. Configure backup and disaster recovery
6. Implement application-level caching (Redis)
7. Add CDN (Cloud CDN or Cloud Load Balancer)

## Useful Commands Cheat Sheet

```bash
# Quick redeploy after code changes
./deploy-backend.sh
./deploy-frontend.sh

# View logs
gcloud run logs tail hotel-saas-backend --region $GCP_REGION

# Connect to database
gcloud sql connect $DB_INSTANCE_NAME --user=postgres

# List all Cloud Run services
gcloud run services list --region $GCP_REGION

# Delete services (cleanup)
gcloud run services delete hotel-saas-backend --region $GCP_REGION --quiet
gcloud run services delete hotel-saas-frontend --region $GCP_REGION --quiet

# Delete Cloud SQL instance
gcloud sql instances delete $DB_INSTANCE_NAME --quiet
```

## Support

For issues or questions:
- Check [Cloud Run documentation](https://cloud.google.com/run/docs)
- Check [Cloud SQL documentation](https://cloud.google.com/sql/docs)
- Review application logs in Cloud Console

---

**Last Updated**: 2025-12-10
