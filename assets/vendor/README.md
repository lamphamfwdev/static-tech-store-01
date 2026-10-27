# HEIC/HEIF decoder

`heic2any-0.0.4.min.js` is the unmodified browser distribution of **heic2any 0.0.4**, downloaded from:

https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js

Upstream source: https://github.com/alexcorvi/heic2any

The upstream MIT license is included in `heic2any-LICENSE.md`. The package is based on libheif and other image encoding components; see the upstream source repository for those components and their licenses. This vendored package loads only when an image cannot be decoded natively and its type is HEIC/HEIF. The storefront never loads the decoder.

The Apps Script Admin uses the same pinned package from jsDelivr because Apps Script HTML cannot serve the project's `assets/` directory. If a HEIC variant is unsupported, Admin gives a concrete fallback: open the original in macOS Preview, choose File → Export → JPEG, then import the JPEG.

Version pinning avoids a silent dependency update. No CDN request is needed for HEIC decoding in the local Admin.
