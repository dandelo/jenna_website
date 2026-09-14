# Jenna's Home Countdown

A standalone static countdown and daily scrapbook app served from
`/home-countdown/` in the shared `happybirthdayjenna.co.uk` S3 bucket.

The countdown target is set in `script.js` to noon BST on Friday 14 August 2026.
The daily pockets unlock by UK calendar date from 5 August through completion
day.

Listing photos are saved locally under `assets/listing/` from Rightmove property
`169279901`.

## Local Preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/home-countdown/
```

## Deploy

```bash
cd home-countdown/terraform
AWS_PROFILE=my-account-dylan terraform init
AWS_PROFILE=my-account-dylan terraform plan -out home-countdown.tfplan
AWS_PROFILE=my-account-dylan terraform apply home-countdown.tfplan
```
