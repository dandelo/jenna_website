# Tiny Wins Todo Terraform

This Terraform project uploads the todo app to the existing
`happybirthdayjenna.co.uk` S3 bucket under the `/todo/` path.

It does not create or modify the bucket, CloudFront distribution, certificate,
or DNS records. Those are managed by the root Terraform project.

## Deploy

```bash
cd todo/terraform
AWS_PROFILE=my-account-dylan terraform init
AWS_PROFILE=my-account-dylan terraform plan -out todo.tfplan
AWS_PROFILE=my-account-dylan terraform apply todo.tfplan
```

The app will be available at:

```text
https://happybirthdayjenna.co.uk/todo/
```
