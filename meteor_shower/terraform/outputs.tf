output "bucket_name" {
  description = "S3 bucket used as the private CloudFront origin."
  value       = local.bucket_id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront hosted zone ID for alias records."
  value       = aws_cloudfront_distribution.site.hosted_zone_id
}

output "website_url" {
  description = "Primary HTTPS website URL."
  value       = "https://${local.domain_aliases[0]}"
}

output "domain_aliases" {
  description = "Custom domain aliases configured on CloudFront."
  value       = local.domain_aliases
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN used by CloudFront."
  value       = local.cloudfront_certificate_arn
}

output "uploaded_files" {
  description = "Website files managed as S3 objects."
  value       = sort(tolist(local.site_files))
}
