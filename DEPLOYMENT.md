# GitHub Pages deployment

This is a buildless HTML/CSS/JavaScript portfolio. `dist/` is the source and publish directory. Node.js is used only for local preview and validation; the public site needs no server.

## Run and validate locally

```powershell
npm start
npm run build
```

Open http://127.0.0.1:4173/ for preview. `npm run build` validates content, assets and repository-relative URLs without rewriting the design or copy. No dependency installation is required.

## Automatic deployment

In the GitHub repository, set **Settings → Pages → Build and deployment → Source → GitHub Actions**. `.github/workflows/pages.yml` validates the site, uploads only `dist/`, then deploys with the built-in GitHub token. No personal token is stored in the workflow.

Every push to `main` deploys automatically. A manual run is also available under **Actions → Deploy portfolio to GitHub Pages → Run workflow**. The successful deployment job reports the actual HTTPS URL.

## Publish future edits

```powershell
npm run build
git add dist package.json check.cjs check-pages.cjs .github .gitignore .gitattributes README.md DEPLOYMENT.md server.cjs
git commit -m "Update portfolio"
git push origin main
```

Change copy in `dist/content.js`, rendering and interactions in `dist/app.js`, styles in `dist/styles.css`, and images in `dist/assets/`. Commit new public assets along with the referencing code. Local scripts, exported previews, original project documents and credentials are excluded by `.gitignore`.

## Routing, media and troubleshooting

- Cases use `#/project/xiaomi` and other hash routes. Refreshing a case therefore loads `index.html` correctly on Pages.
- Scripts, styles and images use relative URLs, so both a user site and a repository site work without changing the base path.
- Videos link to Douyin and posts/profiles link to Xiaohongshu. Playback and login requirements are controlled by those platforms. A successful Pages deployment cannot guarantee third-party short-link availability.
- If deployment fails, inspect the failed Actions step. Verify Pages uses GitHub Actions, the latest push is on `main`, and the account/repository supports Pages.
- Public repositories are suitable for GitHub Free Pages. Private-repository Pages availability depends on the GitHub plan. Website visitors can see the portfolio content and its contact details.
