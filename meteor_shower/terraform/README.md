# Terraform Deployment

This Terraform project deploys the static site in the repository root to an S3
bucket named `happybirthdayjenna.co.uk`, fronted by CloudFront over HTTPS.

## What It Manages

- S3 bucket creation, unless `create_bucket = false`
- Private S3 origin access through CloudFront Origin Access Control
- CloudFront distribution with HTTP-to-HTTPS redirects
- ACM certificate in `us-east-1`
- Route 53 DNS validation records for the certificate
- Route 53 A and AAAA alias records for `happybirthdayjenna.co.uk`
- Bucket owner enforced object ownership
- Bucket-level public access blocking
- SSE-S3 default encryption
- Versioning
- Upload of `index.html`, `styles.css`, `script.js`, and everything in `assets/`

## Deploy

```bash
cd terraform
terraform init
terraform plan -out site.tfplan
terraform apply site.tfplan
```

The defaults assume the public Route 53 hosted zone for
`happybirthdayjenna.co.uk` is in the same AWS account. If you have multiple
matching zones, set the exact hosted zone ID in `terraform.tfvars`:

```hcl
route53_zone_id = "Z1234567890ABC"
```

If `happybirthdayjenna.co.uk` already exists in your AWS account but is not
managed by this Terraform state, set:

```hcl
create_bucket = false
```

CloudFront deployments and ACM validation can take several minutes.

## Output

After apply, Terraform prints:

- `website_url` - `https://happybirthdayjenna.co.uk`
- `cloudfront_domain_name` - fallback CloudFront domain and DNS target
- `cloudfront_distribution_id` - useful for future invalidations
