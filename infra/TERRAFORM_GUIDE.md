# Terraform Infrastructure Guide

Complete guide for managing the Hotel SaaS infrastructure with Terraform.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Deployment Workflow](#deployment-workflow)
3. [Database Management](#database-management)
4. [Making Changes](#making-changes)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Topics](#advanced-topics)

---

## Initial Setup

### 1. Install Prerequisites

```bash
# Install Terraform
brew install terraform  # macOS
# OR download from https://www.terraform.io/downloads

# Install gcloud CLI
brew install google-cloud-sdk  # macOS
# OR download from https://cloud.google.com/sdk/docs/install

# Install PostgreSQL client (for database initialization)
brew install postgresql  # macOS

# Install Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy
sudo mv cloud-sql-proxy /usr/local/bin/
```

### 2. Configure GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Authenticate with GCP
gcloud auth login
gcloud config set project $PROJECT_ID

# Set up application default credentials
gcloud auth application-default login

# Enable required APIs
gcloud services enable \
  compute.googleapis.com \
  servicenetworking.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com
```

### 3. Configure Environment

```bash
cd infra

# Edit the environment-specific variables
vi environments/dev/terraform.tfvars

# Update the following values:
# - project_id: Your GCP project ID
# - region: Your preferred GCP region (default: us-central1)
```

### 4. Initialize Terraform

```bash
# Initialize Terraform (downloads providers)
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive
```

---

## Deployment Workflow

### Development Environment

```bash
# Step 1: Review what will be created
terraform plan -var-file=environments/dev/terraform.tfvars

# Step 2: Apply the infrastructure
terraform apply -var-file=environments/dev/terraform.tfvars

# Step 3: View outputs
terraform output

# Step 4: Save outputs to file
terraform output -json > outputs.json
```

### Staging Environment

```bash
# Same process, different tfvars file
terraform plan -var-file=environments/staging/terraform.tfvars
terraform apply -var-file=environments/staging/terraform.tfvars
```

### Production Environment

```bash
# Production requires extra care
# Step 1: Review the plan carefully
terraform plan -var-file=environments/prod/terraform.tfvars -out=prod.tfplan

# Step 2: Review the plan file
terraform show prod.tfplan

# Step 3: Apply the plan
terraform apply prod.tfplan

# Step 4: Verify everything is working
terraform output
```

### Using Workspaces (Recommended)

Terraform workspaces provide better isolation:

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch to dev workspace
terraform workspace select dev

# Apply for the current workspace
terraform apply -var-file=environments/dev/terraform.tfvars

# List workspaces
terraform workspace list

# Current workspace
terraform workspace show
```

---

## Database Management

### Initialize Database Schema

After deploying the infrastructure, initialize the database:

```bash
# Option 1: Use the provided script
./scripts/init-database.sh

# Option 2: Manual initialization
# Get connection details
export CLOUD_SQL_INSTANCE=$(terraform output -raw database_connection_name)
export DB_NAME=$(terraform output -raw database_name)

# Start Cloud SQL Proxy
cloud-sql-proxy $CLOUD_SQL_INSTANCE &

# Get password from Secret Manager
export PGPASSWORD=$(gcloud secrets versions access latest --secret=db-password)

# Run schema
psql -h 127.0.0.1 -U postgres -d $DB_NAME -f modules/database/schema.sql

# Stop proxy
pkill cloud-sql-proxy
```

### Connect to Database

```bash
# Start Cloud SQL Proxy
cloud-sql-proxy $(terraform output -raw database_connection_name) &

# Connect with psql
PGPASSWORD=$(gcloud secrets versions access latest --secret=db-password) \
  psql -h 127.0.0.1 -U postgres -d hotelsaas

# Stop proxy when done
pkill cloud-sql-proxy
```

### Database Backups

View and restore backups:

```bash
# List backups
gcloud sql backups list --instance=$(terraform output -raw database_instance_name)

# Create on-demand backup
gcloud sql backups create --instance=$(terraform output -raw database_instance_name)

# Restore from backup
gcloud sql backups restore <BACKUP_ID> \
  --backup-instance=$(terraform output -raw database_instance_name) \
  --backup-id=<BACKUP_ID>
```

---

## Making Changes

### Updating Resources

```bash
# Step 1: Modify the configuration
vi environments/dev/terraform.tfvars

# Step 2: Review the changes
terraform plan -var-file=environments/dev/terraform.tfvars

# Step 3: Apply the changes
terraform apply -var-file=environments/dev/terraform.tfvars
```

### Scaling the Database

```bash
# Edit the tfvars file
vi environments/prod/terraform.tfvars

# Change database_tier to a larger instance
# database_tier = "db-custom-4-15360"  # 4 vCPU, 15 GB RAM

# Apply the change
terraform plan -var-file=environments/prod/terraform.tfvars
terraform apply -var-file=environments/prod/terraform.tfvars
```

### Adding New Resources

```bash
# Step 1: Add resource to appropriate module
vi modules/storage/main.tf

# Step 2: Validate syntax
terraform validate

# Step 3: Format code
terraform fmt

# Step 4: Review changes
terraform plan -var-file=environments/dev/terraform.tfvars

# Step 5: Apply
terraform apply -var-file=environments/dev/terraform.tfvars
```

---

## Troubleshooting

### Common Issues

#### Issue: State Lock Error

```bash
# Error: Error acquiring the state lock

# Solution: Force unlock (only if you're sure no other process is running)
terraform force-unlock <LOCK_ID>
```

#### Issue: API Not Enabled

```bash
# Error: googleapi: Error 403: ... API has not been used

# Solution: Enable the required API
gcloud services enable <API_NAME>
```

#### Issue: Private Service Connection Timeout

```bash
# Error: Error waiting for Create Service Networking Connection

# Solution: This can take 10-15 minutes. Just wait and retry.
# If it continues to fail, delete and recreate:
terraform destroy -target=google_service_networking_connection.private_vpc_connection
terraform apply -var-file=environments/dev/terraform.tfvars
```

#### Issue: Database Creation Timeout

```bash
# Error: timeout while waiting for state to become 'RUNNABLE'

# Solution: Cloud SQL instance creation takes 10-15 minutes
# Increase the timeout or just wait and retry
terraform apply -var-file=environments/dev/terraform.tfvars
```

### Debugging

```bash
# Enable debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform-debug.log

# Run terraform command
terraform apply -var-file=environments/dev/terraform.tfvars

# View logs
cat terraform-debug.log

# Disable logging
unset TF_LOG
unset TF_LOG_PATH
```

### State Management

```bash
# View state
terraform show

# List resources in state
terraform state list

# Show specific resource
terraform state show google_sql_database_instance.main

# Remove resource from state (doesn't delete actual resource)
terraform state rm google_sql_database_instance.main

# Import existing resource
terraform import google_sql_database_instance.main <INSTANCE_NAME>

# Pull remote state
terraform state pull

# Push local state (use with caution)
terraform state push
```

---

## Advanced Topics

### Remote State Storage

Configure GCS backend for team collaboration:

```bash
# Create bucket for state
export STATE_BUCKET="${PROJECT_ID}-terraform-state"
gsutil mb gs://$STATE_BUCKET
gsutil versioning set on gs://$STATE_BUCKET

# Enable object versioning for state recovery
gsutil lifecycle set state-lifecycle.json gs://$STATE_BUCKET
```

Create `state-lifecycle.json`:
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 10,
          "withState": "ARCHIVED"
        }
      }
    ]
  }
}
```

Update `main.tf` to use remote backend:
```hcl
terraform {
  backend "gcs" {
    bucket = "your-project-terraform-state"
    prefix = "terraform/state"
  }
}
```

Migrate to remote backend:
```bash
terraform init -migrate-state
```

### Multi-Environment Management

Use Terraform Cloud workspaces:

```bash
# Create organization and workspaces in Terraform Cloud
# https://app.terraform.io

# Configure backend
terraform {
  cloud {
    organization = "your-org"
    workspaces {
      name = "hotel-saas-dev"
    }
  }
}

# Login to Terraform Cloud
terraform login

# Initialize
terraform init
```

### Import Existing Resources

If you have existing GCP resources:

```bash
# Import VPC
terraform import module.networking.google_compute_network.vpc projects/PROJECT_ID/global/networks/VPC_NAME

# Import Cloud SQL instance
terraform import module.database.google_sql_database_instance.main PROJECT_ID:INSTANCE_NAME

# Import GCS bucket
terraform import module.storage.google_storage_bucket.images PROJECT_ID/BUCKET_NAME
```

### Terraform Modules Best Practices

1. **Use Semantic Versioning for Modules**
   ```hcl
   module "networking" {
     source  = "git::https://github.com/your-org/terraform-modules.git//networking?ref=v1.0.0"
   }
   ```

2. **Pin Provider Versions**
   ```hcl
   terraform {
     required_providers {
       google = {
         source  = "hashicorp/google"
         version = "= 5.10.0"  # Exact version
       }
     }
   }
   ```

3. **Use Data Sources for Dynamic Values**
   ```hcl
   data "google_project" "project" {}

   output "project_number" {
     value = data.google_project.project.number
   }
   ```

### Disaster Recovery

#### Backup State

```bash
# Pull and save state
terraform state pull > terraform.tfstate.backup.$(date +%Y%m%d)

# Save to GCS
gsutil cp terraform.tfstate.backup.* gs://$STATE_BUCKET/backups/
```

#### Restore from Backup

```bash
# Download backup
gsutil cp gs://$STATE_BUCKET/backups/terraform.tfstate.backup.20250101 .

# Push to remote
terraform state push terraform.tfstate.backup.20250101
```

### Cost Optimization

```bash
# Estimate costs before applying
terraform plan -var-file=environments/prod/terraform.tfvars | \
  grep -E 'google_sql_database_instance|google_compute_router_nat'

# Use Cloud NAT only when needed
# Set enable_nat = false in tfvars for dev environment

# Use ZONAL instead of REGIONAL for non-production
# database_availability_type = "ZONAL"
```

### Automated Testing

```bash
# Install terraform-compliance
pip install terraform-compliance

# Create test files in tests/
mkdir -p tests

# Run tests
terraform-compliance -f tests/ -p plan.out
```

Example test (`tests/security.feature`):
```gherkin
Feature: Security compliance
  Scenario: Cloud SQL should not have public IP
    Given I have google_sql_database_instance defined
    When it has settings
    Then it must have ip_configuration
    And it must have ipv4_enabled
    And its value must be false
```

---

## Cleanup

### Destroy Development Environment

```bash
# Review what will be destroyed
terraform plan -destroy -var-file=environments/dev/terraform.tfvars

# Destroy
terraform destroy -var-file=environments/dev/terraform.tfvars
```

### Destroy Production (Careful!)

```bash
# Production has deletion protection enabled
# First, disable protection
terraform apply -var-file=environments/prod/terraform.tfvars \
  -var="deletion_protection=false"

# Then destroy
terraform destroy -var-file=environments/prod/terraform.tfvars
```

### Selective Destroy

```bash
# Destroy only specific resource
terraform destroy -target=module.storage.google_storage_bucket.images \
  -var-file=environments/dev/terraform.tfvars
```

---

## Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Google Cloud Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [GCP Best Practices](https://cloud.google.com/architecture/framework)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

---

**Last Updated**: 2025-12-10
