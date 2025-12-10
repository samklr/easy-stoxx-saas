# Development environment configuration

environment = "dev"

# Update these values for your project
project_id   = "your-project-id-here"
project_name = "hotel-saas"
region       = "us-central1"

# Networking
subnet_cidr = "10.0.0.0/24"
enable_nat  = true
enable_vpn  = false

# Database - Small instance for dev
database_version          = "POSTGRES_15"
database_tier             = "db-f1-micro"
database_disk_size        = 10
database_disk_type        = "PD_SSD"
database_availability_type = "ZONAL"
database_name             = "hotelsaas"
database_backup_enabled   = true
database_backup_start_time = "03:00"

# Storage
storage_class         = "STANDARD"
enable_versioning     = false
lifecycle_age         = 30  # Delete objects after 30 days
enable_public_access  = true
