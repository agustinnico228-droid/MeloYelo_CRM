# Fonts

Display face **Bikys Heading** is awaiting a confirmed web licence (§18.1 of
the build spec). Until then display type uses **Heebo 700** — this is a
deliberate, flagged fallback, not a substitution.

When licensed WOFF2 files arrive:

1. Drop `BikysHeading.woff2` in this folder.
2. Add a `next/font/local` declaration in `src/app/layout.tsx` with
   `variable: "--font-bikys"` and `display: "swap"`.
3. In `src/app/globals.css`, change `--font-display` to
   `var(--font-bikys), var(--font-heebo), system-ui, sans-serif`.
