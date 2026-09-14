# Home Firsts Bingo

A standalone static fridge-magnet bingo site served from `/firsts-bingo/` in the
shared `happybirthdayjenna.co.uk` S3 bucket.

The app stores completed squares in a browser cookie scoped to `/firsts-bingo`,
so one device keeps its board after refreshes. There is no server-side database
or cross-device sync.

## Local Preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/firsts-bingo/
```

## Deploy

```bash
cd firsts-bingo/terraform
AWS_PROFILE=my-account-dylan terraform init
AWS_PROFILE=my-account-dylan terraform plan -out firsts-bingo.tfplan
AWS_PROFILE=my-account-dylan terraform apply firsts-bingo.tfplan
```
