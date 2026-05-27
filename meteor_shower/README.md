# Next Meteor Shower UK

Static single-page site for S3 hosting.

## Files

- `index.html` - page markup
- `styles.css` - responsive styling and animation
- `script.js` - UK clock, countdown, and event status
- `assets/meteor-hero.png` - generated hero illustration

## S3 Hosting

Upload the files at the project root to your bucket, preserving the `assets/`
folder. Configure static website hosting with:

- Index document: `index.html`
- Error document: `index.html` or your preferred error page

Recommended content types:

- `.html`: `text/html`
- `.css`: `text/css`
- `.js`: `application/javascript`
- `.png`: `image/png`

Data checked on 1 May 2026 from Royal Museums Greenwich, American Meteor
Society, and timeanddate.com.

## Terraform

A Terraform project is available in `terraform/` to configure the S3 static
website bucket, upload these files, and serve the site through CloudFront over
HTTPS at `happybirthdayjenna.co.uk`.
