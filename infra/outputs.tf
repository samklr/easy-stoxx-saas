# Output values from the infrastructure

output "vpc_id" {
  description = "The ID of the VPC network"
  value       = module.networking.vpc_id
}

output "vpc_self_link" {
  description = "The self-link of the VPC network"
  value       = module.networking.vpc_self_link
}

output "subnet_id" {
  description = "The ID of the subnet"
  value       = module.networking.subnet_id
}

output "subnet_self_link" {
  description = "The self-link of the subnet"
  value       = module.networking.subnet_self_link
}

output "database_instance_name" {
  description = "The name of the Cloud SQL instance"
  value       = module.database.instance_name
}

output "database_connection_name" {
  description = "The connection name of the Cloud SQL instance"
  value       = module.database.connection_name
}

output "database_private_ip" {
  description = "The private IP address of the Cloud SQL instance"
  value       = module.database.private_ip
  sensitive   = true
}

output "database_name" {
  description = "The name of the database"
  value       = module.database.database_name
}

output "bucket_name" {
  description = "The name of the GCS bucket"
  value       = module.storage.bucket_name
}

output "bucket_url" {
  description = "The URL of the GCS bucket"
  value       = module.storage.bucket_url
}

output "bucket_self_link" {
  description = "The self-link of the GCS bucket"
  value       = module.storage.bucket_self_link
}
