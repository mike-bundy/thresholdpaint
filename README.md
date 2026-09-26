# Threshold Painting & Maintenance — website

Static site for [thresholdpaint.com](https://www.thresholdpaint.com). Plain HTML, CSS and JavaScript. No build step, no dependencies, hosts on GitHub Pages as-is.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `services.html` | Services (one section per service, linked from the footer) |
| `gallery.html` | Our Work: before/after sliders plus the filterable photo gallery |
| `about.html` | About Garrett / credentials |
| `the-paint-initiative.html` | Blog index |
| `the-paint-initiative/*.html` | Individual blog posts |
| `contact.html` | Contact: call / email tiles, how to get a quote, service area, hours |
| `404.html` | Not-found page (GitHub Pages serves this automatically) |

Shared code lives in `assets/css/style.css` and `assets/js/main.js`. Project photos are in `images/gallery/` (full size) and `images/gallery/thumbs/` (720px, used in grids and sliders). Background photos on section headers are pulled from Unsplash at load time.

## Deploy to GitHub Pages

1. Create a new GitHub repository and push this folder to the `main` branch.
2. In the repo go to **Settings → Pages**, set Source to **Deploy from a branch**, pick `main` and `/ (root)`, save.
3. The site is live within a minute at `https://<username>.github.io/<repo>/`.

### Custom domain (thresholdpaint.com)

1. In **Settings → Pages → Custom domain** enter `www.thresholdpaint.com` and save. GitHub will create a `CNAME` file in the repo.
2. At the domain registrar, add a `CNAME` record for `www` pointing to `<username>.github.io`, and `A` records for the apex domain pointing to GitHub's Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).
3. Once DNS propagates, tick **Enforce HTTPS**.

All links in the site are relative, so it works at either the github.io URL or the custom domain.

## Contact

The contact page has no form. It links straight to the phone number (`tel:`) and email (`mailto:`), with a copy-to-clipboard button for the address. If a form is wanted later, FormSubmit (formsubmit.co) works with a static site; the JavaScript already contains an AJAX handler for a `form[data-ajax]` element.

## Editing

- **Phone, email, hours, service areas:** search the HTML files for the value and replace. They appear in the header, footer and contact page of every file.
- **Adding gallery photos:** drop the full-size JPEG in `images/gallery/`, a 720px copy in `images/gallery/thumbs/` with the same name, and add a `<figure>` block in `gallery.html` following the existing pattern (`data-cat` controls the filter).
- **Adding a before/after slider:** copy one `.ba` block in `gallery.html` or `index.html` and change the two image paths and captions.
- **Adding a blog post:** copy one of the files in `the-paint-initiative/`, edit the content, then add a card for it in `the-paint-initiative.html` and a line in `sitemap.xml`.
