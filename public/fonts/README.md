# Fonts

**Bikys-Bold.woff2** — Bikys Heading, the MeloYelo display face (weight
700, the only weight the brand uses). Sourced from the meloyelo.nz
production site's own theme (`wp-content/themes/bikys/assets/fonts/new/`),
i.e. the file MeloYelo already serves publicly on its website. Wired via
`next/font/local` in `src/app/layout.tsx` as `--font-bikys`; Heebo 700
remains the fallback in `--font-display`.

§18.1 note: the build spec flagged display type as "Heebo fallback
pending a Bikys web licence". The Hub now uses the same font file the
company site serves — confirm with Greg that the site's font licence
covers this internal app, and if it doesn't, delete this file and the
`localFont` block in `layout.tsx`; everything falls back to Heebo 700
automatically.
