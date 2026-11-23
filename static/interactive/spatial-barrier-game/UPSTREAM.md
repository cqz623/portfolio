# Spatial Barrier Game — vendored application

Source: https://github.com/cqz623/spatial-barrier-game
Commit: 729ce505c3cb65277c0a54a2e5b4dbf71ca2db6c

The five runtime files are unmodified copies. Keep their relative paths intact.
The portfolio embeds `index.html` in an iframe; no portfolio styles are injected.

Upstream Git blob hashes:

- index.html: 1954c55c669a9a4d70c175f05bc044c415ffc424
- style.css: 5a4d6f5546e2e5325355adad2f67b8d6d0f8c218
- app.js: 1ac498a6111bea54f2eaed67a31c67aa641b9130
- atlas.js: 3036a8d883eaedb434e61f446a53eddead3ea875
- core.js: bfa8aff87a9bbbd64ab19581e13ee27ca125494d

Original core tests are retained in `tests/spatial-barrier/core.test.js`, with
only their import path adapted to this checkout. Run `npm run test:spatial`.

For a repository-prefix verification build:

    PORTFOLIO_BASE_PATH=/architecture-portfolio npm run build
    PORTFOLIO_BASE_PATH=/architecture-portfolio npm run verify:spatial

Then `npm run build` restores a root-prefix build. This integration does not
configure a static deployment adapter or publish anything to GitHub Pages.
