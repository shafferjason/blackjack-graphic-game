# Exact Approved Face Card Asset Verification

**Branch:** `pre-production/exact-approved-face-cards`
**Source of Truth:** `preview/pd-face-cards-v4/`
**Integration Target:** `src/components/faceCardTextures.ts`

## Verification Method

Each texture data URI from the approved `texture-data-uris.json` was compared byte-for-byte
against the corresponding constant in `faceCardTextures.ts` using SHA-256 hashes.

## Data URI Hash Comparison (Approved vs Integrated)

| Asset | Approved SHA-256 | Integrated SHA-256 | Status |
|-------|-----------------|-------------------|--------|
| CANVAS_GRAIN | `2d8c0cfb13cbbfdb7868fcbaee0a05f1256b554aa218500d740c24e1d1b87665` | `2d8c0cfb13cbbfdb7868fcbaee0a05f1256b554aa218500d740c24e1d1b87665` | EXACT MATCH |
| SKIN_PAINT | `6127b828eab4979050fe49e1b568f6e7caed9156d878efb0cfe7e3b4d42d96c7` | `6127b828eab4979050fe49e1b568f6e7caed9156d878efb0cfe7e3b4d42d96c7` | EXACT MATCH |
| FABRIC_PAINT | `9f7019cf759ba3699f713f1ae98a26e56427be56b0e36b523d3ebecb384b8506` | `9f7019cf759ba3699f713f1ae98a26e56427be56b0e36b523d3ebecb384b8506` | EXACT MATCH |
| HAIR_PAINT | `a65cc50d2f23cef7f3e9b8da89384bafb0b7108901b4931251ebe0cae6a4f903` | `a65cc50d2f23cef7f3e9b8da89384bafb0b7108901b4931251ebe0cae6a4f903` | EXACT MATCH |
| BRUSH_OVERLAY | `52fbe89cb6712c6e3d5bc3478d22b92e6c880d81eed4967197d89fd4f18a1dc5` | `52fbe89cb6712c6e3d5bc3478d22b92e6c880d81eed4967197d89fd4f18a1dc5` | EXACT MATCH |

## Approved Source PNG File Hashes

| File | SHA-256 |
|------|---------|
| texture-canvas-grain.png | `8426c8f086d0376ed9f7340ab1bb62224a3520743e4e917b92a44df222204bcb` |
| texture-skin-paint.png | `87e468e41a786e185bc38217652f849cfa9e9b0b7a238aaded8f4344e8f9a372` |
| texture-fabric-paint.png | `7a0d552177c6332646a9f9faf8da05dea4433a401f5acf88d9e6781452c322e1` |
| texture-hair-paint.png | `570ddc09fed8895eef9b18af24530dcd0e0878cb037be2988db70c4454224230` |
| texture-brush-overlay.png | `882cf793bdadab856b7267eb15181cf61541924cf73c467eeb302efc63cdf806` |

## Approved Manifest File Hashes

| File | SHA-256 |
|------|---------|
| texture-data-uris.json | `38a88158c6dbde030c2ae7ec159970afc49ff4fc29dd76d2db980ef56fc0fa60` |
| jack-french-hybrid-v4.svg | `c8dd262609bd49dde2a2a8b52fe0b002c6fa9f1abe1c162524d78e46705f006a` |

## Integration File Hash

| File | SHA-256 |
|------|---------|
| src/components/faceCardTextures.ts | `3041a68b0b4f336877b7f462591fd80ef3bff8a5dc2e66e3013c877ba735b10f` |

## Conclusion

All 5 texture data URIs in the integrated `faceCardTextures.ts` are **byte-identical**
to the approved assets in `preview/pd-face-cards-v4/texture-data-uris.json`.
No style reinterpretation or modification was applied. Gameplay logic is unchanged.

**Status:** Ready for stakeholder review via draft preview deployment.
