# Hotel SaaS Infrastructure - Terraform

This directory contains Terraform infrastructure as code (IaC) for deploying the Hotel SaaS MVP to Google Cloud Platform.

## Architecture Overview

The infrastructure consists of:

1. **Networking** - VPC, subnets, Cloud NAT, private service connection
2. **Database** - Cloud SQL PostgreSQL instance with private IP
3. **Storage** - Google Cloud Storage bucket for images

```
┌─────────────────────────────────────────────────────────────┐
│                         VPC Network                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Cloud Run   │  │  Cloud Run   │  │   Cloud NAT  │      │
│  │   Backend    │  │  Frontend    │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                  │                                  │
│         │                  │                                  │
│  ┌──────▼──────────────────▼───────┐                        │
│  │      Cloud SQL PostgreSQL       │                        │
│  │       (Private IP Only)         │                        │
│  └─────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
         │
         └──────────────────┐
                            │
                     ┌──────▼──────┐
                     │     GCS     │
                     │   Bucket    │
                     └─────────────┘
```

## Directory Structure

```
infra/
├── main.tf                    # Root module
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── README.md                  # This file
├── modules/                   # Reusable modules
│   ├── networking/           # VPC, subnets, NAT
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/             # Cloud SQL PostgreSQL
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── schema.sql        # Database schema
│   └── storage/              # GCS bucket
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/              # Environment-specific configs
    ├── dev/
    │   └── terraform.tfvars
    ├── staging/
    │   └── terraform.tfvars
    └── prod/
        └── terraform.tfvars
```

## Prerequisites

1. **Google Cloud Project**
   ```bash
   export PROJECT_ID="your-project-id"
   gcloud config set project $PROJECT_ID
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable \
     compute.googleapis.com \
     servicenetworking.googleapis.com \
     sqladmin.googleapis.com \
     storage.googleapis.com \
     secretmanager.googleapis.com \
     cloudresourcemanager.googleapis.com
   ```

3. **Terraform Installation**
   - Install Terraform >= 1.5.0
   - https://www.terraform.io/downloads

4. **Authentication**
   ```bash
   gcloud auth application-default login
   ```

## Quick Start

### 1. Initialize Terraform

```bash
cd infra
terraform init
```

### 2. Deploy to Development

```bash
# Review the plan
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply the changes
terraform apply -var-file=environments/dev/terraform.tfvars
```

### 3. Deploy to Staging

```bash
terraform plan -var-file=environments/staging/terraform.tfvars
terraform apply -var-file=environments/staging/terraform.tfvars
```

### 4. Deploy to Production

```bash
terraform plan -var-file=environments/prod/terraform.tfvars
terraform apply -var-file=environments/prod/terraform.tfvars
```

## Configuration

### Environment Variables

Before deploying, update the `terraform.tfvars` file for your environment:

```bash
# Edit the appropriate environment file
vi environments/dev/terraform.tfvars
```

Key variables to configure:
- `project_id` - Your GCP project ID
- `region` - GCP region (default: us-central1)
- `database_tier` - Cloud SQL instance size
- `database_availability_type` - ZONAL or REGIONAL

### Backend Configuration

For production use, configure remote state storage:

1. Create a GCS bucket for state:
   ```bash
   gsutil mb gs://${PROJECT_ID}-terraform-state
   gsutil versioning set on gs://${PROJECT_ID}-terraform-state
   ```

2. Uncomment the backend configuration in `main.tf`:
   ```hcl
   backend "gcs" {
     bucket = "your-project-terraform-state"
     prefix = "terraform/state"
   }
   ```

3. Initialize with the backend:
   ```bash
   terraform init -migrate-state
   ```

## Database Schema Initialization

The database schema is defined in `modules/database/schema.sql`. To initialize:

### Option 1: Manual Initialization

```bash
# Get the database connection name
export CLOUD_SQL_INSTANCE=$(terraform output -raw database_connection_name)

# Connect using Cloud SQL Proxy
cloud-sql-proxy $CLOUD_SQL_INSTANCE &

# Run the schema
PGPASSWORD=$(gcloud secrets versions access latest --secret=db-password) \
  psql -h 127.0.0.1 -U postgres -d hotelsaas -f modules/database/schema.sql
```

### Option 2: Automated via Cloud Build

The schema can be applied automatically during the CI/CD pipeline. See [CICD_SETUP.md](../CICD_SETUP.md) for details.

## Outputs

After deployment, Terraform provides useful outputs:

```bash
# View all outputs
terraform output

# Get specific values
terraform output database_connection_name
terraform output bucket_name
terraform output vpc_id
```

### Important Outputs

| Output | Description | Usage |
|--------|-------------|-------|
| `database_connection_name` | Cloud SQL connection string | Set as `CLOUD_SQL_INSTANCE` env var |
| `database_name` | Database name | Set as `DB_NAME` env var |
| `bucket_name` | GCS bucket name | Set as `GCS_BUCKET_NAME` env var |
| `vpc_self_link` | VPC network link | Used for VPC connectors |

## Resource Costs

Estimated monthly costs per environment:

### Development
- **Cloud SQL (db-f1-micro)**: ~$7/month
- **Cloud NAT**: ~$45/month
- **GCS Storage (10 GB)**: ~$0.20/month
- **Total**: ~$52/month

### Staging
- **Cloud SQL (db-g1-small)**: ~$25/month
- **Cloud NAT**: ~$45/month
- **GCS Storage (50 GB)**: ~$1/month
- **Total**: ~$71/month

### Production
- **Cloud SQL (db-custom-2-7680, REGIONAL)**: ~$200/month
- **Cloud NAT**: ~$45/month
- **GCS Storage (200 GB)**: ~$4/month
- **Total**: ~$249/month

*Note: Costs vary based on usage. These are baseline estimates.*

## Destroying Infrastructure

To tear down all resources:

```bash
# DANGER: This will delete all resources
terraform destroy -var-file=environments/dev/terraform.tfvars
```

For production, deletion protection is enabled on the database. To destroy:

```bash
# Remove deletion protection first
terraform apply -var-file=environments/prod/terraform.tfvars \
  -var="deletion_protection=false"

# Then destroy
terraform destroy -var-file=environments/prod/terraform.tfvars
```

## Best Practices

### 1. Use Workspaces for Environments

```bash
# Create workspace for each environment
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch between workspaces
terraform workspace select dev
terraform apply -var-file=environments/dev/terraform.tfvars
```

### 2. Plan Before Apply

Always review the plan before applying:

```bash
terraform plan -out=tfplan -var-file=environments/dev/terraform.tfvars
terraform apply tfplan
```

### 3. Use Remote State

Store state in GCS with versioning and locking:

```hcl
backend "gcs" {
  bucket = "your-project-terraform-state"
  prefix = "terraform/state"
}
```

### 4. Enable State Locking

Use GCS backend for automatic state locking to prevent concurrent modifications.

### 5. Use Variables

Never hardcode values. Use variables and environment-specific tfvars files.

### 6. Tag Resources

All resources are tagged with:
- `project` - Project name
- `environment` - Environment (dev/staging/prod)
- `managed_by` - terraform

## Troubleshooting

### Issue: API not enabled

**Error**: `Error: Error creating Network: googleapi: Error 403`

**Solution**:
```bash
gcloud services enable compute.googleapis.com
```

### Issue: Private service connection failed

**Error**: `Error: Error waiting for Create Service Networking Connection`

**Solution**: Ensure the Service Networking API is enabled and the VPC has been created first.

### Issue: Database creation timeout

**Error**: `Error: timeout while waiting for state`

**Solution**: Cloud SQL instance creation can take 10-15 minutes. Increase timeout or wait and retry.

### Issue: Terraform state locked

**Error**: `Error: Error acquiring the state lock`

**Solution**:
```bash
# Force unlock (use with caution)
terraform force-unlock <LOCK_ID>
```

## Security Considerations

1. **Private Database**: Cloud SQL uses private IP only, no public exposure
2. **Secret Management**: Database password stored in Secret Manager
3. **IAM Permissions**: Follows principle of least privilege
4. **Network Isolation**: VPC with private service connection
5. **Encryption**: All data encrypted at rest and in transit

## Maintenance

### Updating Terraform

```bash
# Check current version
terraform version

# Upgrade providers
terraform init -upgrade
```

### Database Backups

Automated backups are configured:
- **Dev**: 7 days retention
- **Staging**: 7 days retention
- **Production**: 30 days retention + point-in-time recovery

### Monitoring

View resources in GCP Console:
- **Cloud SQL**: https://console.cloud.google.com/sql
- **VPC**: https://console.cloud.google.com/networking/networks
- **GCS**: https://console.cloud.google.com/storage

## Next Steps

1. Set up Terraform Cloud or Terraform Enterprise for team collaboration
2. Implement automated testing with `terraform test`
3. Add monitoring and alerting with Cloud Monitoring
4. Configure custom domains and SSL certificates
5. Set up disaster recovery procedures

## Support

For issues or questions:
1. Check the [DEPLOYMENT.md](../DEPLOYMENT.md) guide
2. Review Terraform documentation: https://www.terraform.io/docs
3. Check GCP status: https://status.cloud.google.com

---

**Last Updated**: 2025-12-10
**Terraform Version**: >= 1.5.0
**Provider Versions**: google ~> 5.0
