# Main Terraform configuration for Hotel SaaS Infrastructure
# This is the root module that orchestrates all infrastructure components

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Backend configuration for state management
  # Uncomment and configure for production use
  # backend "gcs" {
  #   bucket = "hotel-saas-terraform-state"
  #   prefix = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Local variables
locals {
  common_tags = {
    project     = "hotel-saas"
    environment = var.environment
    managed_by  = "terraform"
    terraform   = "true"
  }
}

# Enable required Google Cloud APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "storage.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# Networking Module
module "networking" {
  source = "./modules/networking"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  vpc_name           = "${var.project_name}-vpc-${var.environment}"
  subnet_cidr        = var.subnet_cidr
  enable_nat         = var.enable_nat
  enable_vpn         = var.enable_vpn

  labels = local.common_tags

  depends_on = [google_project_service.required_apis]
}

# Database Module
module "database" {
  source = "./modules/database"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  instance_name       = "${var.project_name}-db-${var.environment}"
  database_version    = var.database_version
  tier                = var.database_tier
  disk_size           = var.database_disk_size
  disk_type           = var.database_disk_type
  availability_type   = var.database_availability_type

  database_name       = var.database_name

  backup_enabled      = var.database_backup_enabled
  backup_start_time   = var.database_backup_start_time

  private_network     = module.networking.vpc_self_link

  labels = local.common_tags

  depends_on = [
    module.networking,
    google_project_service.required_apis
  ]
}

# Storage Module
module "storage" {
  source = "./modules/storage"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  bucket_name           = "${var.project_name}-images-${var.environment}"
  storage_class         = var.storage_class
  enable_versioning     = var.enable_versioning
  lifecycle_age         = var.lifecycle_age
  enable_public_access  = var.enable_public_access

  labels = local.common_tags

  depends_on = [google_project_service.required_apis]
}
