# Send Return website

Static website for https://sendreturn.ch.

## GitHub Pages

Upload the contents of this folder to the root of the `website` repository.
In Settings → Pages select Deploy from a branch, main, / (root).
Set the custom domain to sendreturn.ch before changing DNS.
Enable Enforce HTTPS when the certificate becomes available.

## Editing

Main pages: index.html, creative.html, artist.html, case.html.
Artist profiles and individual booking links: artists.js.
Styles: style.css. Assets: assets/. Sphere animation: sphere-animation.js.
After editing index.html, creative.html or artist.html run:
node tools/build-transition-pages.mjs

Keep CNAME and .nojekyll in the repository root.
