locals {
  source_dir        = abspath("${path.module}/..")
  normalized_prefix = trimsuffix(trimprefix(var.site_prefix, "/"), "/")

  primary_site_files = [
    "index.html",
    "styles.css",
    "script.js",
  ]

  versioned_site_files = {
    "script.20260812-theme-toggle.js"  = "script.js"
    "styles.20260812-theme-toggle.css" = "styles.css"
  }

  asset_site_files = {
    for file in fileset(local.source_dir, "assets/**") : file => file
  }

  site_files = merge(
    { for file in local.primary_site_files : file => file },
    local.versioned_site_files,
    local.asset_site_files,
  )

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

  no_cache_files = toset([
    "index.html",
    "script.js",
    "styles.css",
    "script.20260812-theme-toggle.js",
    "styles.20260812-theme-toggle.css",
  ])
}

data "aws_s3_bucket" "shared" {
  bucket = var.bucket_name
}

resource "aws_s3_object" "site_files" {
  for_each = local.site_files

  bucket       = data.aws_s3_bucket.shared.id
  key          = "${local.normalized_prefix}/${each.key}"
  source       = "${local.source_dir}/${each.value}"
  etag         = filemd5("${local.source_dir}/${each.value}")
  content_type = lookup(local.content_types, lower(element(reverse(split(".", each.key)), 0)), "application/octet-stream")

  cache_control = contains(local.no_cache_files, each.key) ? "no-cache" : "public, max-age=3600"
}

resource "aws_s3_object" "directory_index" {
  bucket        = data.aws_s3_bucket.shared.id
  key           = "${local.normalized_prefix}/"
  source        = "${local.source_dir}/index.html"
  etag          = filemd5("${local.source_dir}/index.html")
  content_type  = "text/html; charset=utf-8"
  cache_control = "no-cache"
}

resource "aws_s3_object" "prefix_redirect" {
  bucket        = data.aws_s3_bucket.shared.id
  key           = local.normalized_prefix
  source        = "${local.source_dir}/redirect.html"
  etag          = filemd5("${local.source_dir}/redirect.html")
  content_type  = "text/html; charset=utf-8"
  cache_control = "no-cache"
}
