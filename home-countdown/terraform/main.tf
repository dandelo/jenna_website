locals {
  source_dir        = abspath("${path.module}/..")
  normalized_prefix = trimsuffix(trimprefix(var.site_prefix, "/"), "/")

  site_files = toset(concat(
    [
      "index.html",
      "styles.css",
      "script.js",
    ],
    tolist(fileset(local.source_dir, "assets/**"))
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

  no_cache_files = toset([
    "index.html",
    "script.js",
  ])
}

data "aws_s3_bucket" "shared" {
  bucket = var.bucket_name
}

resource "aws_s3_object" "site_files" {
  for_each = local.site_files

  bucket       = data.aws_s3_bucket.shared.id
  key          = "${local.normalized_prefix}/${each.value}"
  source       = "${local.source_dir}/${each.value}"
  etag         = filemd5("${local.source_dir}/${each.value}")
  content_type = lookup(local.content_types, lower(element(reverse(split(".", each.value)), 0)), "application/octet-stream")

  cache_control = contains(local.no_cache_files, each.value) ? "no-cache" : "public, max-age=3600"
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
