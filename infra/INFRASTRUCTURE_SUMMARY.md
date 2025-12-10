# Infrastructure Summary

Complete Terraform infrastructure for Hotel SaaS MVP on Google Cloud Platform.

## What Was Created

### 1. Core Infrastructure Modules

#### Networking Module ([modules/networking/](modules/networking/))
- **VPC Network**: Isolated virtual network for all resources
- **Subnet**: Regional subnet with private Google access enabled
- **Private Service Connection**: Dedicated connection for Cloud SQL
- **Cloud NAT**: Outbound internet access for private instances
- **Firewall Rules**:
  - Internal communication within VPC
  - Health checks from Google Cloud
  - SSH access via Identity-Aware Proxy

**Key Features:**
- VPC Flow Logs for debugging
- Private IP range reservation (16-bit prefix)
- Cloud Router with BGP
- Network isolation per environment

#### Database Module ([modules/database/](modules/database/))
- **Cloud SQL PostgreSQL**: Managed database instance
- **Private IP Only**: No public internet exposure
- **Automated Backups**: Daily backups with configurable retention
- **Secret Manager Integration**: Secure password storage
- **Database Schema**: Complete schema with tables, indexes, views

**Tables Created:**
- `users`: User accounts (ORG_OWNER, MANAGER, STAFF)
- `inventory_items`: Inventory tracking with categories
- `inventory_transactions`: Stock movement history (IN/OUT/ADJUSTMENT)

**Database Features:**
- Automated `updated_at` triggers
- Low stock items view
- Inventory value aggregation view
- Point-in-time recovery (production)
- Query insights enabled
- IAM authentication enabled

#### Storage Module ([modules/storage/](modules/storage/))
- **GCS Bucket**: Object storage for images
- **CORS Configuration**: Cross-origin upload support
- **IAM Permissions**: Public read, Cloud Run write access
- **Lifecycle Policies**: Automated cleanup of old versions
- **Folder Structure**: Organized storage for different asset types

**Folders:**
- `inventory-items/`: Product images
- `user-avatars/`: User profile pictures
- `temp/`: Temporary uploads

### 2. Environment Configurations

#### Development ([environments/dev/](environments/dev/))
- **Purpose**: Local development and testing
- **Database**: `db-f1-micro` (shared CPU, 0.6 GB RAM)
- **Availability**: ZONAL (single zone)
- **Disk**: 10 GB SSD
- **Lifecycle**: 30 days retention
- **Cost**: ~$52/month

#### Staging ([environments/staging/](environments/staging/))
- **Purpose**: Pre-production testing
- **Database**: `db-g1-small` (shared CPU, 1.7 GB RAM)
- **Availability**: ZONAL
- **Disk**: 20 GB SSD
- **Lifecycle**: 90 days retention
- **Cost**: ~$71/month

#### Production ([environments/prod/](environments/prod/))
- **Purpose**: Live production workload
- **Database**: `db-custom-2-7680` (2 vCPU, 7.5 GB RAM)
- **Availability**: REGIONAL (high availability)
- **Disk**: 50 GB SSD
- **Lifecycle**: No auto-deletion
- **Versioning**: Enabled
- **Backups**: 30 days retention + PITR
- **Cost**: ~$249/month

### 3. Database Schema

Complete PostgreSQL schema matching JPA entities:

```sql
users
├── id (BIGSERIAL PRIMARY KEY)
├── name (VARCHAR)
├── email (VARCHAR UNIQUE)
├── role (VARCHAR CHECK: ORG_OWNER, MANAGER, STAFF)
├── pin (VARCHAR)
├── status (VARCHAR CHECK: ACTIVE, INACTIVE, SUSPENDED)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

inventory_items
├── id (BIGSERIAL PRIMARY KEY)
├── name (VARCHAR)
├── description (TEXT)
├── category (VARCHAR)
├── quantity (INTEGER CHECK >= 0)
├── min_quantity (INTEGER CHECK >= 0)
├── unit (VARCHAR)
├── cost_per_unit (DECIMAL)
├── supplier (VARCHAR)
├── location (VARCHAR)
├── image_url (TEXT)
├── status (VARCHAR CHECK: ACTIVE, INACTIVE, DISCONTINUED)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by_id (FK → users)
└── updated_by_id (FK → users)

inventory_transactions
├── id (BIGSERIAL PRIMARY KEY)
├── inventory_item_id (FK → inventory_items)
├── transaction_type (VARCHAR CHECK: STOCK_IN, STOCK_OUT, ADJUSTMENT)
├── quantity (INTEGER)
├── quantity_before (INTEGER)
├── quantity_after (INTEGER)
├── notes (TEXT)
├── transaction_date (TIMESTAMP)
├── created_by_id (FK → users)
└── created_at (TIMESTAMP)
```

**Database Views:**
- `low_stock_items`: Items below minimum quantity
- `inventory_value`: Total value by category

### 4. Automation Scripts

#### Database Initialization ([scripts/init-database.sh](scripts/init-database.sh))
Automated script to:
- Check prerequisites (gcloud, psql, cloud-sql-proxy)
- Retrieve database connection details from Terraform
- Get password from Secret Manager
- Start Cloud SQL Proxy
- Run schema SQL file
- Verify tables created
- Cleanup

### 5. Documentation

#### README.md
- Architecture overview
- Directory structure
- Quick start guide
- Configuration reference
- Resource costs
- Security considerations
- Troubleshooting

#### TERRAFORM_GUIDE.md
- Comprehensive Terraform guide
- Initial setup instructions
- Deployment workflows
- Database management
- State management
- Advanced topics
- Disaster recovery

## File Structure

```
infra/
├── main.tf                           # Root module orchestration
├── variables.tf                      # Input variables
├── outputs.tf                        # Output values
├── .gitignore                        # Git ignore patterns
├── README.md                         # Infrastructure overview
├── TERRAFORM_GUIDE.md                # Complete Terraform guide
├── INFRASTRUCTURE_SUMMARY.md         # This file
│
├── modules/                          # Reusable Terraform modules
│   ├── networking/                   # VPC, subnets, NAT, firewall
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/                     # Cloud SQL PostgreSQL
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── schema.sql                # Database schema
│   └── storage/                      # GCS bucket
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── environments/                     # Environment-specific configs
│   ├── dev/
│   │   └── terraform.tfvars         # Development variables
│   ├── staging/
│   │   └── terraform.tfvars         # Staging variables
│   └── prod/
│       └── terraform.tfvars         # Production variables
│
└── scripts/                          # Helper scripts
    └── init-database.sh              # Database schema initialization
```

## Key Design Decisions

### Security
1. **Private Database**: Cloud SQL uses private IP only, no public exposure
2. **Secret Management**: Passwords stored in Secret Manager, not environment variables
3. **Network Isolation**: VPC with private service connection
4. **IAM Permissions**: Principle of least privilege
5. **Encryption**: All data encrypted at rest and in transit

### High Availability (Production)
1. **Regional Availability**: Database replicated across zones
2. **Automated Backups**: Daily backups with 30-day retention
3. **Point-in-Time Recovery**: Restore to any point in last 7 days
4. **Deletion Protection**: Prevents accidental database deletion

### Cost Optimization
1. **Environment-Specific Sizing**: Right-sized resources per environment
2. **Auto-scaling**: Database disk auto-resizes as needed
3. **Lifecycle Policies**: Automatic cleanup of old objects
4. **ZONAL for Non-Prod**: Development and staging use single-zone

### Operational Excellence
1. **Infrastructure as Code**: All resources defined in Terraform
2. **Modular Design**: Reusable modules for different environments
3. **Version Control**: Configuration tracked in Git
4. **Documentation**: Comprehensive guides and examples
5. **Automation**: Scripts for common operations

## How to Use

### Deploy to Development

```bash
cd infra

# 1. Initialize
terraform init

# 2. Plan
terraform plan -var-file=environments/dev/terraform.tfvars

# 3. Apply
terraform apply -var-file=environments/dev/terraform.tfvars

# 4. Initialize database
./scripts/init-database.sh
```

### Deploy to Production

```bash
# 1. Review plan carefully
terraform plan -var-file=environments/prod/terraform.tfvars -out=prod.tfplan

# 2. Review the plan file
terraform show prod.tfplan

# 3. Apply
terraform apply prod.tfplan

# 4. Initialize database
./scripts/init-database.sh
```

### Get Infrastructure Outputs

```bash
# View all outputs
terraform output

# Get specific values for GitHub Secrets
echo "CLOUD_SQL_INSTANCE: $(terraform output -raw database_connection_name)"
echo "DB_NAME: $(terraform output -raw database_name)"
echo "GCS_BUCKET_NAME: $(terraform output -raw bucket_name)"
```

### Destroy Infrastructure

```bash
# Development (no deletion protection)
terraform destroy -var-file=environments/dev/terraform.tfvars

# Production (requires disabling deletion protection first)
terraform apply -var-file=environments/prod/terraform.tfvars \
  -var="deletion_protection=false"
terraform destroy -var-file=environments/prod/terraform.tfvars
```

## Integration with CI/CD

The Terraform infrastructure integrates with GitHub Actions:

1. **Deploy Infrastructure** using Terraform
2. **Get Outputs** and set as GitHub Secrets:
   - `CLOUD_SQL_INSTANCE`
   - `DB_NAME`
   - `GCS_BUCKET_NAME`
3. **Run GitHub Actions** to deploy applications

See [../.github/workflows/README.md](../.github/workflows/README.md) for CI/CD details.

## Cost Breakdown

### Monthly Costs by Environment

#### Development
| Service | Configuration | Cost/Month |
|---------|--------------|------------|
| Cloud SQL | db-f1-micro | ~$7 |
| Cloud NAT | Standard | ~$45 |
| GCS Storage | 10 GB | ~$0.20 |
| **Total** | | **~$52** |

#### Staging
| Service | Configuration | Cost/Month |
|---------|--------------|------------|
| Cloud SQL | db-g1-small | ~$25 |
| Cloud NAT | Standard | ~$45 |
| GCS Storage | 50 GB | ~$1 |
| **Total** | | **~$71** |

#### Production
| Service | Configuration | Cost/Month |
|---------|--------------|------------|
| Cloud SQL | db-custom-2-7680 (REGIONAL) | ~$200 |
| Cloud NAT | Standard | ~$45 |
| GCS Storage | 200 GB | ~$4 |
| **Total** | | **~$249** |

*Note: Costs are estimates and vary based on actual usage.*

## Next Steps

1. **Set up remote state**: Configure GCS backend for team collaboration
2. **Add monitoring**: Cloud Monitoring for infrastructure metrics
3. **Implement CI/CD**: Automate deployments with GitHub Actions
4. **Configure alerts**: Set up budget alerts and uptime monitoring
5. **Test disaster recovery**: Practice backup restoration procedures

## Support

For issues or questions:
- Review [README.md](README.md) for quick reference
- Check [TERRAFORM_GUIDE.md](TERRAFORM_GUIDE.md) for detailed instructions
- Consult Terraform documentation: https://www.terraform.io/docs
- Check GCP documentation: https://cloud.google.com/docs

---

**Created**: 2025-12-10
**Terraform Version**: >= 1.5.0
**Provider Version**: google ~> 5.0
**Status**: Production Ready ✅
