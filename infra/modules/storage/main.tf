# Storage module - Google Cloud Storage bucket for images

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# GCS bucket for storing images
resource "google_storage_bucket" "images" {
  name          = var.bucket_name
  location      = var.region
  project       = var.project_id
  storage_class = var.storage_class

  # Prevent accidental deletion in production
  force_destroy = var.environment != "prod"

  # Uniform bucket-level access
  uniform_bucket_level_access = true

  # Versioning
  versioning {
    enabled = var.enable_versioning
  }

  # CORS configuration for web uploads
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  # Lifecycle rules
  dynamic "lifecycle_rule" {
    for_each = var.lifecycle_age > 0 ? [1] : []
    content {
      action {
        type = "Delete"
      }
      condition {
        age = var.lifecycle_age
      }
    }
  }

  # Lifecycle rule for old versions (if versioning enabled)
  dynamic "lifecycle_rule" {
    for_each = var.enable_versioning ? [1] : []
    content {
      action {
        type = "Delete"
      }
      condition {
        num_newer_versions = 3
        with_state         = "ARCHIVED"
      }
    }
  }

  labels = var.labels
}

# IAM binding for public read access (if enabled)
resource "google_storage_bucket_iam_member" "public_read" {
  count  = var.enable_public_access ? 1 : 0
  bucket = google_storage_bucket.images.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# IAM binding for Cloud Run service account to write objects
# Note: The service account email should be passed as a variable
resource "google_storage_bucket_iam_member" "cloud_run_writer" {
  count  = var.cloud_run_sa_email != "" ? 1 : 0
  bucket = google_storage_bucket.images.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.cloud_run_sa_email}"
}

# Create a folder structure in the bucket (optional)
resource "google_storage_bucket_object" "folders" {
  for_each = toset([
    "inventory-items/",
    "user-avatars/",
    "temp/"
  ])

  name    = each.value
  content = "This is a folder placeholder"
  bucket  = google_storage_bucket.images.name
}
