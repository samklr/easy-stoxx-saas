# Terraform Quick Reference

Quick commands for common operations.

## Initial Setup

```bash
# Install Terraform
brew install terraform

# Authenticate to GCP
gcloud auth application-default login

# Navigate to infra directory
cd infra

# Initialize Terraform
terraform init
```

## Deploy Infrastructure

```bash
# Development
terraform apply -var-file=environments/dev/terraform.tfvars

# Staging
terraform apply -var-file=environments/staging/terraform.tfvars

# Production
terraform apply -var-file=environments/prod/terraform.tfvars
```

## Review Changes

```bash
# Plan without applying
terraform plan -var-file=environments/dev/terraform.tfvars

# Save plan to file
terraform plan -var-file=environments/prod/terraform.tfvars -out=prod.tfplan

# Show saved plan
terraform show prod.tfplan

# Apply saved plan
terraform apply prod.tfplan
```

## View Outputs

```bash
# All outputs
terraform output

# Specific output
terraform output database_connection_name
terraform output bucket_name

# JSON format
terraform output -json

# Save outputs to file
terraform output -json > outputs.json
```

## Database Operations

```bash
# Initialize database schema
./scripts/init-database.sh

# Connect to database
cloud-sql-proxy $(terraform output -raw database_connection_name) &
PGPASSWORD=$(gcloud secrets versions access latest --secret=db-password) \
  psql -h 127.0.0.1 -U postgres -d hotelsaas
```

## State Management

```bash
# View state
terraform show

# List resources
terraform state list

# Show specific resource
terraform state show module.database.google_sql_database_instance.main

# Remove from state (doesn't delete resource)
terraform state rm module.storage.google_storage_bucket.images

# Import existing resource
terraform import module.storage.google_storage_bucket.images PROJECT_ID/BUCKET_NAME
```

## Workspaces

```bash
# Create workspace
terraform workspace new dev

# List workspaces
terraform workspace list

# Switch workspace
terraform workspace select staging

# Current workspace
terraform workspace show

# Delete workspace
terraform workspace delete dev
```

## Formatting and Validation

```bash
# Format all .tf files
terraform fmt -recursive

# Validate configuration
terraform validate

# Check for syntax errors
terraform validate
```

## Destroy Resources

```bash
# Development
terraform destroy -var-file=environments/dev/terraform.tfvars

# Production (disable deletion protection first)
terraform apply -var-file=environments/prod/terraform.tfvars \
  -var="deletion_protection=false"
terraform destroy -var-file=environments/prod/terraform.tfvars

# Destroy specific resource
terraform destroy -target=module.storage.google_storage_bucket.images \
  -var-file=environments/dev/terraform.tfvars
```

## Debugging

```bash
# Enable debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform-debug.log

# Run command
terraform apply -var-file=environments/dev/terraform.tfvars

# Disable logging
unset TF_LOG
unset TF_LOG_PATH
```

## Common Outputs for GitHub Secrets

```bash
# Get values for GitHub Secrets
echo "CLOUD_SQL_INSTANCE=$(terraform output -raw database_connection_name)"
echo "DB_NAME=$(terraform output -raw database_name)"
echo "GCS_BUCKET_NAME=$(terraform output -raw bucket_name)"

# Get database password
gcloud secrets versions access latest --secret=db-password
```

## Resource Information

```bash
# List Cloud SQL instances
gcloud sql instances list

# List GCS buckets
gsutil ls

# List VPC networks
gcloud compute networks list

# Describe Cloud SQL instance
gcloud sql instances describe $(terraform output -raw database_instance_name)
```

## Troubleshooting

```bash
# Refresh state
terraform refresh -var-file=environments/dev/terraform.tfvars

# Force unlock state (if locked)
terraform force-unlock <LOCK_ID>

# Re-initialize (upgrade providers)
terraform init -upgrade

# Clean and re-initialize
rm -rf .terraform
terraform init
```

## Cost Estimation

```bash
# View resource costs in plan
terraform plan -var-file=environments/prod/terraform.tfvars | \
  grep -E 'google_sql_database_instance|google_compute_router_nat'

# Use terraform-cost-estimation (if installed)
terraform plan -out=tfplan -var-file=environments/prod/terraform.tfvars
terraform-cost-estimation tfplan
```

## Backup and Recovery

```bash
# Pull and backup state
terraform state pull > terraform.tfstate.backup.$(date +%Y%m%d)

# List database backups
gcloud sql backups list --instance=$(terraform output -raw database_instance_name)

# Create on-demand backup
gcloud sql backups create --instance=$(terraform output -raw database_instance_name)
```

## Module-Specific Operations

```bash
# Apply only networking module
terraform apply -target=module.networking -var-file=environments/dev/terraform.tfvars

# Apply only database module
terraform apply -target=module.database -var-file=environments/dev/terraform.tfvars

# Apply only storage module
terraform apply -target=module.storage -var-file=environments/dev/terraform.tfvars
```

## Remote Backend Setup

```bash
# Create state bucket
export STATE_BUCKET="${PROJECT_ID}-terraform-state"
gsutil mb gs://$STATE_BUCKET
gsutil versioning set on gs://$STATE_BUCKET

# Initialize with backend
terraform init -migrate-state

# Pull remote state
terraform state pull

# Push local state (use with caution)
terraform state push terraform.tfstate
```

## Tips

- **Always run `terraform plan` before `apply`**
- **Use workspaces for environment isolation**
- **Save production plans with `-out` flag**
- **Enable deletion protection for production**
- **Store state in GCS for team collaboration**
- **Use `-auto-approve` only in automation**
- **Tag all resources with environment labels**
- **Document changes in Git commits**

---

**For detailed documentation, see:**
- [README.md](README.md) - Overview and getting started
- [TERRAFORM_GUIDE.md](TERRAFORM_GUIDE.md) - Complete guide
- [INFRASTRUCTURE_SUMMARY.md](INFRASTRUCTURE_SUMMARY.md) - What was created
