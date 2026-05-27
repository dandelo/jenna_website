locals {
  site_source_dir = abspath("${path.module}/..")
  domain_aliases  = distinct(concat([var.domain_name], var.alternate_domain_names))
  resource_prefix = substr(replace(var.domain_name, ".", "-"), 0, 48)

  site_files = toset(concat(
    [
      "index.html",
      "styles.css",
      "script.js",
    ],
    tolist(fileset(local.site_source_dir, "assets/**"))
  ))

  content_types = {
    css  = "text/css; charset=utf-8"
    gif  = "image/gif"
    html = "text/html; charset=utf-8"
    ico  = "image/x-icon"
    jpg  = "image/jpeg"
    jpeg = "image/jpeg"
    js   = "application/javascript; charset=utf-8"
    json = "application/json; charset=utf-8"
    png  = "image/png"
    svg  = "image/svg+xml"
    txt  = "text/plain; charset=utf-8"
    webp = "image/webp"
  }
}

resource "aws_s3_bucket" "site" {
  count = var.create_bucket ? 1 : 0

  bucket        = var.bucket_name
  force_destroy = var.force_destroy
  tags          = var.tags
}

data "aws_s3_bucket" "site" {
  count = var.create_bucket ? 0 : 1

  bucket = var.bucket_name
}

locals {
  bucket_id                   = one(concat(aws_s3_bucket.site[*].id, data.aws_s3_bucket.site[*].id))
  bucket_arn                  = one(concat(aws_s3_bucket.site[*].arn, data.aws_s3_bucket.site[*].arn))
  bucket_regional_domain_name = one(concat(aws_s3_bucket.site[*].bucket_regional_domain_name, data.aws_s3_bucket.site[*].bucket_regional_domain_name))
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = local.bucket_id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = local.bucket_id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = local.bucket_id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${local.resource_prefix}-oac"
  description                       = "Allow CloudFront to read ${var.bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_cache_policy" "site" {
  name        = "${local.resource_prefix}-cache"
  comment     = "Cache static website assets while respecting origin Cache-Control headers."
  default_ttl = 3600
  max_ttl     = 86400
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_response_headers_policy" "security" {
  name    = "${local.resource_prefix}-security"
  comment = "Basic security headers for the static website."

  security_headers_config {
    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      override                   = true
      preload                    = false
    }

    xss_protection {
      mode_block = true
      override   = true
      protection = true
    }
  }
}

data "aws_route53_zone" "site" {
  count = var.route53_zone_id == null ? 1 : 0

  name         = trimsuffix(var.domain_name, ".")
  private_zone = false
}

locals {
  route53_zone_id = var.route53_zone_id != null ? var.route53_zone_id : data.aws_route53_zone.site[0].zone_id
}

resource "aws_acm_certificate" "site" {
  provider = aws.us_east_1
  count    = var.acm_certificate_arn == null ? 1 : 0

  domain_name               = local.domain_aliases[0]
  subject_alternative_names = slice(local.domain_aliases, 1, length(local.domain_aliases))
  validation_method         = "DNS"
  tags                      = var.tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "certificate_validation" {
  for_each = var.acm_certificate_arn == null ? {
    for option in aws_acm_certificate.site[0].domain_validation_options : option.domain_name => {
      name   = option.resource_record_name
      record = option.resource_record_value
      type   = option.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.route53_zone_id
}

resource "aws_acm_certificate_validation" "site" {
  provider = aws.us_east_1
  count    = var.acm_certificate_arn == null ? 1 : 0

  certificate_arn         = aws_acm_certificate.site[0].arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}

locals {
  cloudfront_certificate_arn = var.acm_certificate_arn != null ? var.acm_certificate_arn : aws_acm_certificate_validation.site[0].certificate_arn
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = var.domain_name
  default_root_object = "index.html"
  aliases             = local.domain_aliases
  price_class         = "PriceClass_100"
  tags                = var.tags

  origin {
    domain_name              = local.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
    origin_id                = "s3-${local.bucket_id}"
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = aws_cloudfront_cache_policy.site.id
    compress                   = true
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    target_origin_id           = "s3-${local.bucket_id}"
    viewer_protocol_policy     = "redirect-to-https"
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = local.cloudfront_certificate_arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  depends_on = [aws_acm_certificate_validation.site]
}

resource "aws_route53_record" "site_alias_ipv4" {
  count = length(local.domain_aliases)

  allow_overwrite = true
  name            = local.domain_aliases[count.index]
  type            = "A"
  zone_id         = local.route53_zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
  }
}

resource "aws_route53_record" "site_alias_ipv6" {
  count = length(local.domain_aliases)

  allow_overwrite = true
  name            = local.domain_aliases[count.index]
  type            = "AAAA"
  zone_id         = local.route53_zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
  }
}

data "aws_iam_policy_document" "cloudfront_read" {
  statement {
    sid    = "AllowCloudFrontRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${local.bucket_arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "cloudfront_read" {
  bucket = local.bucket_id
  policy = data.aws_iam_policy_document.cloudfront_read.json
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = local.bucket_id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true

  depends_on = [aws_s3_bucket_policy.cloudfront_read]
}

resource "aws_s3_object" "site_files" {
  for_each = local.site_files

  bucket       = local.bucket_id
  key          = each.value
  source       = "${local.site_source_dir}/${each.value}"
  etag         = filemd5("${local.site_source_dir}/${each.value}")
  content_type = lookup(local.content_types, lower(element(reverse(split(".", each.value)), 0)), "application/octet-stream")

  cache_control = each.value == "index.html" ? "no-cache" : "public, max-age=3600"

  depends_on = [
    aws_s3_bucket_ownership_controls.site,
    aws_s3_bucket_server_side_encryption_configuration.site,
  ]
}
