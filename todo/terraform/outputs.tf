output "bucket_name" {
  description = "S3 bucket where the todo app is uploaded."
  value       = data.aws_s3_bucket.shared.id
}

output "site_prefix" {
  description = "S3 key prefix for the todo app."
  value       = local.normalized_prefix
}

output "website_url" {
  description = "Public CloudFront URL for the todo app."
  value       = "https://${var.domain_name}/${local.normalized_prefix}/"
}

output "uploaded_files" {
  description = "Todo app S3 object keys managed by this project."
  value = sort(concat(
    [for file in local.site_files : "${local.normalized_prefix}/${file}"],
    [
      local.normalized_prefix,
      "${local.normalized_prefix}/",
    ]
  ))
}
