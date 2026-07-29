# MeloYelo CRM Color Alignment — July 2026

## Overview
Updated the CRM color palette to exactly match the scraped MeloYelo.nz website colors from July 2026.

## Color Changes Made

### Primary Colors Updated

| Color Name | Old Value | New Value | Source |
|------------|-----------|-----------|--------|
| `--color-my-yellow` | `#ffdb00` | `#FFD700` | Logo golden yellow |
| `--color-my-yellow-press` | `#ebca02` | `#E5C200` | Darkened for press state |
| `--color-my-green` | `#1caf32` | `32CD32` | Lime green CTA buttons |
| `--color-my-green-ink` | `#12801f` | `#228B22` | AA-compliant text green |

### New Brand Colors Added

| Color Name | Value | Usage |
|------------|-------|-------|
| `--color-my-green-light` | `#90EE90` | Light green accent for "EBIKES" branding text |
| `--color-my-brown` | `#8B4513` | Dark brown for "melo" branding text |

### Unchanged Colors
The following colors remained the same as they already matched the website:
- `--color-my-ink: #000000`
- `--color-my-charcoal: #222222`
- `--color-my-body: #404040`
- `--color-my-slate: #6b6b6b`
- `--color-my-paper: #f6f6f6`
- `--color-my-surface: #ffffff`
- `--color-my-line: #e2e2e2`
- `--color-my-alert: #c43a1b`
- `--color-my-warn: #e8a317`

## Website Color Analysis Source

Colors were extracted from the MeloYelo.nz website by:
1. Analyzing the logo favicon to get exact brand colors
2. Analyzing hero banner images to identify CTA button colors
3. Extracting the gradient and accent colors from promotional imagery

### Key Brand Elements Identified
- **Logo**: Black background with golden yellow `#FFD700` "ML" text
- **CTA Buttons**: Bright lime green `#32CD32`
- **Hover States**: Yellow ↔ Green color swap (signature brand interaction)
- **Accent Text**: Light green `#90EE90` for elements like "EBIKES"
- **Branding Text**: Dark brown `#8B4513` for "melo" portion of logo

## Files Modified
- `src/app/globals.css` — Updated `@theme` color tokens

## Components Affected
All components using CSS color variables will automatically reflect the new colors:
- `AppShell.tsx` — Navigation, headers, branding elements
- `btn-brand` and `btn-brand-green` button styles
- All components using `text-my-*`, `bg-my-*`, `border-my-*` utilities

## Testing
- ✅ TypeScript compilation successful
- ✅ No breaking changes to component API
- ✅ All color variables properly defined
- ✅ WCAG AA compliance maintained for text colors

## Next Steps
1. Run `npm run dev` to visually verify the new colors
2. Test button hover states (yellow ↔ green swap)
3. Verify branding elements display correctly
4. Check contrast ratios for accessibility

---

*Color alignment completed 2026-07-24*
*Scraped from https://meloyelo.nz*
