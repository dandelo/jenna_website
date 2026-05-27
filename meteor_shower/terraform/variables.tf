variable "aws_region" {
  description = "AWS region for the S3 bucket and website configuration."
  type        = string
  default     = "eu-west-2"
}

variable "bucket_name" {
  description = "S3 bucket name for the static website."
  type        = string
  default     = "happybirthdayjenna.co.uk"
}

variable "domain_name" {
  description = "Primary domain name served by CloudFront."
  type        = string
  default     = "happybirthdayjenna.co.uk"
}

variable "alternate_domain_names" {
  description = "Additional domain aliases for the CloudFront distribution, such as www.happybirthdayjenna.co.uk."
  type        = list(string)
  default     = []
}

variable "route53_zone_id" {
  description = "Route 53 public hosted zone ID. Leave null to look up the zone for domain_name in this AWS account."
  type        = string
  default     = null
}

variable "acm_certificate_arn" {
  description = "Existing us-east-1 ACM certificate ARN for CloudFront. Leave null to create and DNS-validate one."
  type        = string
  default     = null
}

variable "create_bucket" {
  description = "Create the bucket when true. Set to false if the bucket already exists in the target AWS account."
  type        = bool
  default     = true
}

variable "force_destroy" {
  description = "Allow Terraform to delete the bucket even when it contains objects. Keep false unless you really want destroy to remove site content."
  type        = bool
  default     = false
}

variable "enable_versioning" {
  description = "Enable S3 bucket versioning for uploaded website files."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags applied to managed AWS resources."
  type        = map(string)
  default = {
    Project   = "happybirthdayjenna.co.uk"
    ManagedBy = "Terraform"
  }
}
