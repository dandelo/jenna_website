output "bucket_name" {
  description = "S3 bucket where the firsts bingo app is uploaded."
  value       = data.aws_s3_bucket.shared.id
}

output "site_prefix" {
  description = "S3 key prefix for the firsts bingo app."
  value       = local.normalized_prefix
}

output "website_url" {
  description = "Public CloudFront URL for the firsts bingo app."
  value       = "https://${var.domain_name}/${local.normalized_prefix}/"
}

output "uploaded_files" {
  description = "Firsts bingo app S3 object keys managed by this project."
  value = sort(concat(
    [for file in local.site_files : "${local.normalized_prefix}/${file}"],
    [
      local.normalized_prefix,
      "${local.normalized_prefix}/",
    ]
  ))
}
