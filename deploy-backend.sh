#!/bin/bash

# Deploy Backend to Google Cloud Run
# This script builds and deploys the Spring Boot backend to Cloud Run

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - Update these values
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="hotel-saas-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Cloud SQL Configuration
CLOUD_SQL_INSTANCE="${CLOUD_SQL_INSTANCE:-your-project:region:instance-name}"
DB_NAME="${DB_NAME:-hotelsaas}"
DB_USER="${DB_USER:-postgres}"

# GCS Configuration
GCS_BUCKET_NAME="${GCS_BUCKET_NAME:-hotel-saas-images}"

echo -e "${GREEN}Starting deployment of ${SERVICE_NAME}...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    exit 1
fi

# Verify project ID is set
if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo -e "${RED}Error: Please set GCP_PROJECT_ID environment variable${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}Setting GCP project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${YELLOW}Enabling required Google Cloud APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com

# Build the Docker image using Cloud Build
echo -e "${YELLOW}Building Docker image with Cloud Build...${NC}"
gcloud builds submit ./backend \
    --tag ${IMAGE_NAME} \
    --timeout=15m

# Prompt for database password if not set
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}Please enter the database password:${NC}"
    read -s DB_PASSWORD
fi

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --add-cloudsql-instances ${CLOUD_SQL_INSTANCE} \
    --set-env-vars "SPRING_PROFILES_ACTIVE=prod" \
    --set-env-vars "CLOUD_SQL_INSTANCE=${CLOUD_SQL_INSTANCE}" \
    --set-env-vars "DB_NAME=${DB_NAME}" \
    --set-env-vars "DB_USER=${DB_USER}" \
    --set-env-vars "DB_PASSWORD=${DB_PASSWORD}" \
    --set-env-vars "GCS_PROJECT_ID=${PROJECT_ID}" \
    --set-env-vars "GCS_BUCKET_NAME=${GCS_BUCKET_NAME}" \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300 \
    --port 8080

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo -e "${GREEN}Deployment successful!${NC}"
echo -e "${GREEN}Backend URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}Health check: ${SERVICE_URL}/actuator/health${NC}"

# Test the health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
if curl -f -s "${SERVICE_URL}/actuator/health" > /dev/null; then
    echo -e "${GREEN}Health check passed!${NC}"
else
    echo -e "${RED}Warning: Health check failed. Check logs with:${NC}"
    echo -e "${YELLOW}gcloud run logs read ${SERVICE_NAME} --region ${REGION}${NC}"
fi
