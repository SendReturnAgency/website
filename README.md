# Send Return website

Bilingual static site for https://sendreturn.ch.

## Pages

English: index.html, creative.html, artist.html, case.html.
German: index-de.html, creative-de.html, artist-de.html, case-de.html.
Artist biographies remain in English on both Artist pages.
The legal notice remains in English and is labelled accordingly on German pages.

## Editing

Shared styles: style.css. English interactions: app.js. German interactions: app-de.js.
Profiles and booking URLs: artists.js and artists-de.js.
After changing any intro or agency HTML, run:
node tools/build-transition-pages.mjs
Do not run the historical prototype scripts from the separate working directory.

## Publishing

Upload this folder's CONTENTS to the root of SendReturnAgency/website, replacing matching files.
Keep CNAME and .nojekyll at the root. GitHub Pages: main, / (root), domain sendreturn.ch.
No DNS changes are needed.
