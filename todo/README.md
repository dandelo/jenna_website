# Tiny Wins Todo

A standalone static todo-list site served from `/todo/` in the shared
  `happybirthdayjenna.co.uk` S3 bucket.

The app saves todo changes in a browser cookie scoped to `/todo`, so one device
keeps its list after refreshes. There is no server-side database or cross-device
sync.

## Local Preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/todo/
```

## Deploy

```bash
cd todo/terraform
AWS_PROFILE=my-account-dylan terraform init
AWS_PROFILE=my-account-dylan terraform plan -out todo.tfplan
AWS_PROFILE=my-account-dylan terraform apply todo.tfplan
```
