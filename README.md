# Baba Shree Industries — simple static website

A lightweight, dependency-free website made with plain HTML, CSS and JavaScript. No build step, npm packages, database or server-side code is required.

## Files

- `index.html` — complete one-page website and all page content.
- `styles.css` — responsive layout and styling.
- `script.js` — mobile menu, catalogue search/category filters, product enquiry prefill and WhatsApp form handoff.
- `assets/images/` — logo and a documented place for verified company/product photographs.

## Run locally

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

## Enquiries and privacy

The quotation form opens WhatsApp with the customer's message addressed to **+91 9617999539**. This static site does not save or email submissions. Visitors need WhatsApp to send their enquiry. The other contact number, **+91 9340999539**, is also linked for calls.

There is no admin dashboard or database in this simplified edition. Edit website content directly in `index.html`, styles in `styles.css`, and interactions in `script.js`. Add only client-approved product photos under `assets/images/`; the current product drawings are schematic and intentionally show no technical dimensions.

## Publish with GitHub Pages

The repository contains a GitHub Actions workflow that checks the HTML/JavaScript and publishes the site from `main` using GitHub Pages.

1. In GitHub, open **Settings → Pages** and set the build/deployment source to **GitHub Actions**.
2. Merge the website pull request into `main`. The workflow deploys automatically after the merge.
3. GitHub will provide the public `github.io` URL in **Settings → Pages**. Add a custom domain there if desired.

The current branch can also be previewed in Arena. GitHub Pages is a static host, which fits this no-backend version.
