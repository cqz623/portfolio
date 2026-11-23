# Population × Flood Sandbox — local integration

Repository: https://github.com/cqz623/population-flood-sandbox
Commit: 35c7e5578e65135eefdffdcdcfd6efbed263a2e1

`index.html` and the complete `sandbox/` directory are byte-for-byte original
copies: 37 files, 36,882,476 bytes. `UPSTREAM.json` records every original Git
blob hash and file size. No research dataset was regenerated, simplified,
compressed, omitted, or substituted. Original relative URLs are preserved.

The original application loads Leaflet 1.9.4 from unpkg.com, with its original
integrity attributes. Its Esri tile layers require internet access. Leaflet,
Esri, HERE, Garmin, OpenStreetMap and GIS-user attribution remain intact.

The portfolio's same-origin iframe measures `.page` using ResizeObserver.
It reserves 1400px initially, then adjusts to the dashboard's actual content
height, allowing the main portfolio page to scroll. No styles or scripts are
injected into the original application. The fullscreen link opens index.html
in its own tab. On narrow screens the original responsive dashboard stacks.

This compares precomputed 2020, 2030, 2040 and 2050 scenarios, not validated
causal predictions or hydrodynamic forecasts. The original app aggregates
parcel allocations into a display grid at runtime; it does not write datasets.
The historical point-based counterfactual is distinct from current parcel-based
metrics and must not be interpreted as a directly comparable result.

Verification:

    npm run check
    npm run build
    npm run verify:flood
    npm run verify:spatial
    PORTFOLIO_BASE_PATH=/architecture-portfolio npm run build
    PORTFOLIO_BASE_PATH=/architecture-portfolio npm run verify:flood
    PORTFOLIO_BASE_PATH=/architecture-portfolio npm run verify:spatial

Run `npm run build` again to restore the root-prefix build.
`verify:flood` checks every original file hash, local data resolution, ordering,
iframe and standalone links. It runs the original inline application against
real datasets with DOM/Leaflet adapters and exercises all four year actions.
It does not verify the external renderer, tile availability, or browser layout.
No static deployment adapter or publishing is configured by this integration.
