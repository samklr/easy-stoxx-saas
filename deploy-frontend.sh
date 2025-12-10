#!/bin/bash

# Deploy Frontend to Google Cloud Run
# This script builds and deploys the Next.js frontend to Cloud Run

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - Update these values
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="hotel-saas-frontend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Backend URL (update after deploying backend)
BACKEND_URL="${BACKEND_URL:-https://hotel-saas-backend-xxxxx-uc.a.run.app}"

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

# Verify backend URL is set
if [[ "$BACKEND_URL" == *"xxxxx"* ]]; then
    echo -e "${RED}Error: Please set BACKEND_URL environment variable to your backend Cloud Run URL${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}Setting GCP project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Build the Docker image using Cloud Build
echo -e "${YELLOW}Building Docker image with Cloud Build...${NC}"
gcloud builds submit ./frontend \
    --tag ${IMAGE_NAME} \
    --timeout=15m

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "NEXT_PUBLIC_API_URL=${BACKEND_URL}" \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300 \
    --port 3000

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo -e "${GREEN}Deployment successful!${NC}"
echo -e "${GREEN}Frontend URL: ${SERVICE_URL}${NC}"

# Test the endpoint
echo -e "${YELLOW}Testing frontend...${NC}"
if curl -f -s "${SERVICE_URL}" > /dev/null; then
    echo -e "${GREEN}Frontend is accessible!${NC}"
else
    echo -e "${RED}Warning: Frontend check failed. Check logs with:${NC}"
    echo -e "${YELLOW}gcloud run logs read ${SERVICE_NAME} --region ${REGION}${NC}"
fi

echo -e "${GREEN}Next steps:${NC}"
echo -e "1. Update your DNS to point to: ${SERVICE_URL}"
echo -e "2. Configure custom domain in Cloud Run console"
echo -e "3. Update CORS settings in backend to allow: ${SERVICE_URL}"
