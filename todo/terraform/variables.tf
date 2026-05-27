variable "aws_region" {
  description = "AWS region for the shared S3 bucket."
  type        = string
  default     = "eu-west-2"
}

variable "bucket_name" {
  description = "Existing S3 bucket where the todo app will be uploaded."
  type        = string
  default     = "happybirthdayjenna.co.uk"
}

variable "site_prefix" {
  description = "Path prefix for the todo app in the shared bucket."
  type        = string
  default     = "todo"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-_/]*[a-z0-9]$", var.site_prefix))
    error_message = "site_prefix must be a non-empty S3 key prefix without leading or trailing slashes."
  }
}

variable "domain_name" {
  description = "CloudFront custom domain for output only."
  type        = string
  default     = "happybirthdayjenna.co.uk"
}
