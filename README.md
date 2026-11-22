# zapiltar-e7.github.io

Zapiltar's portfolio, live at https://zapiltar-e7.github.io

Built on the [DarkMinimal](https://themewagon.com/themes/dark-minimal/) Astro + Tailwind template by
[Andres Hernandez](https://github.com/Gothsec), distributed by [ThemeWagon](https://themewagon.com) (MIT, see `LICENSE`).

## Editing

| What | File |
| --- | --- |
| Intro text, social buttons | `src/components/home.astro` |
| "What I do?" list | `src/React/SkillsList.tsx` |
| Scrolling tech strip | `src/components/logoWall.astro` (icons in `public/svg/`) |
| Projects | `src/components/projects.astro` (`image` can be `/images/x.png` in `public/images/`) |
| Contact | `src/components/contact.astro` |
| Footer | `src/components/footer.astro` |

## Run locally

```
npx pnpm@11.2.2 install
npx pnpm@11.2.2 dev
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which builds the site and publishes it to GitHub Pages.

## Optional extras from the template (off for now)

- **Like button:** needs a Firebase project. Fill in `.env` from `.env.example` and add a `PUBLIC_FIREBASE_*` secret set to the deploy workflow, then put `<LikeButton client:load />` back in the footer.
- **Contact form:** uncomment the form in `contact.astro` and set a Formspree form ID.
