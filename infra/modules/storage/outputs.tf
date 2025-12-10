# Storage module outputs

output "bucket_name" {
  description = "The name of the GCS bucket"
  value       = google_storage_bucket.images.name
}

output "bucket_url" {
  description = "The URL of the GCS bucket"
  value       = google_storage_bucket.images.url
}

output "bucket_self_link" {
  description = "The self-link of the GCS bucket"
  value       = google_storage_bucket.images.self_link
}

output "bucket_id" {
  description = "The ID of the GCS bucket"
  value       = google_storage_bucket.images.id
}
