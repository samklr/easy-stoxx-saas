# Production environment configuration

environment = "prod"

# Update these values for your project
project_id   = "your-project-id-here"
project_name = "hotel-saas"
region       = "us-central1"

# Networking
subnet_cidr = "10.2.0.0/24"
enable_nat  = true
enable_vpn  = false

# Database - Production instance with high availability
database_version          = "POSTGRES_15"
database_tier             = "db-custom-2-7680"  # 2 vCPU, 7.5 GB RAM
database_disk_size        = 50
database_disk_type        = "PD_SSD"
database_availability_type = "REGIONAL"  # High availability
database_name             = "hotelsaas"
database_backup_enabled   = true
database_backup_start_time = "03:00"

# Storage
storage_class         = "STANDARD"
enable_versioning     = true  # Enable versioning for production
lifecycle_age         = 0     # Don't auto-delete in production
enable_public_access  = true
