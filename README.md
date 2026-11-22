# zapiltar-e7.github.io

Zapiltar's portfolio, live at https://zapiltar-e7.github.io

Built on the [DarkMinimal](https://themewagon.com/themes/dark-minimal/) Astro + Tailwind template by
[Andres Hernandez](https://github.com/Gothsec), distributed by [ThemeWagon](https://themewagon.com) (MIT, see `LICENSE`).
Social and skill icons from [Remix Icon](https://remixicon.com) (Apache-2.0).
Hero light effect: [LightPillar](https://reactbits.dev) from React Bits (MIT + Commons Clause).

## Editing the site

Double-click **`Edit site.cmd`**. It starts the site on your computer and opens the editor at
http://localhost:4321/editor/ (the first run installs packages, which takes a minute).

In the editor you can:

- change all the text (intro, headings, contact)
- add, remove and reorder **social buttons** (GitHub, Discord, YouTube, email, ...)
- add, remove, duplicate and reorder **project cards**, and drag a picture onto a card to upload it
- edit the "What I do?" list and the scrolling logo strip (you can upload your own SVG logos)

**Save** (or Ctrl+S) shows the change at http://localhost:4321 straight away.
**Publish to GitHub** commits and pushes; the live site updates about 2 minutes later.
Close the black window when you're done.

The editor only runs on your computer and is not part of the published site.

All content lives in `src/data/site.json`, so you can also edit that file by hand.

## Deploy

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which builds the site and publishes it to GitHub Pages.

## Optional extras from the template (off for now)

- **Like button:** needs a Firebase project. Fill in `.env` from `.env.example`, add the `PUBLIC_FIREBASE_*` values as secrets for the deploy workflow, then put `<LikeButton client:load />` back in the footer.
- **Contact form:** uncomment the form in `src/components/contact.astro` and set a Formspree form ID.
