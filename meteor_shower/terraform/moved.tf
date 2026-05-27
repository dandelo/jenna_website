moved {
  from = aws_s3_bucket_policy.public_read
  to   = aws_s3_bucket_policy.cloudfront_read
}
