# Spark Initiative self-hosted fonts

The landing page self-hosts the exact Latin font files that were previously
resolved at build time through `next/font/google`. This makes builds deterministic
and prevents the deployment from carrying every language subset.

- `google-sans-flex-latin-v1.woff2`: Latin variable subset of Google Sans Flex.
  Its embedded metadata identifies Copyright 2015 Google LLC and the Open Font
  License.
- `geist-mono-latin-v1.woff2`: Latin variable subset of Geist Mono. Its embedded
  metadata identifies Copyright 2024 The Geist Project Authors and the Open Font
  License.
- `noto-sans-sc-spark-v1.woff2`: site-specific Simplified Chinese variable subset.

`noto-sans-sc-spark-v1.woff2` is a site-specific variable-font subset generated
from the official `NotoSansSC-VF.otf`. It contains the non-ASCII characters used
by the landing page and progress page, while preserving the original variable
weight axis.

Source font:
https://github.com/notofonts/noto-cjk/raw/main/Sans/Variable/OTF/Subset/NotoSansSC-VF.otf

These fonts are distributed under the SIL Open Font License 1.1 in `OFL.txt`.

To regenerate it after changing Chinese copy:

1. Install `fonttools` and `brotli`, which provide `pyftsubset` and WOFF2 output.
2. Download the official source font above.
3. Run:

```sh
node scripts/subset-noto-font.mjs /path/to/NotoSansSC-VF.otf
```

If the output changes after deployment, bump the font URL version used by the
static homepage and rank page so long-lived caches cannot retain older glyphs.
