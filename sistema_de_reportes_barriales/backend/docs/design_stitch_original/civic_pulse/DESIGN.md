---
name: Civic Pulse
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5c403c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#916f6b'
  outline-variant: '#e6bdb8'
  surface-tint: '#bf0715'
  primary: '#b70011'
  on-primary: '#ffffff'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#ffb4ab'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#7f4f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a06500'
  on-tertiary-container: '#fff7f1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an authoritative, highly accessible, and civic-minded interface for municipal incident management and neighborhood reporting. The aesthetic direction fuses **Corporate / Modern** civic reliability with modern, high-clarity digital ergonomics.

The visual language balances two primary user groups:
1. **Citizens:** Needing an immediate, frictionless, reassuring interface to log urban issues (potholes, public lighting, trash, civic safety) under varying field conditions (daylight glare, single-handed mobile usage).
2. **Municipal Operators:** Needing scannable, dense, calm, and unambiguous operational dashboards to triage, route, and resolve incident workflows.

The interface projects institutional transparency, urgency without panic, and operational rigor. It avoids overly dense bureaucratic aesthetics by utilizing generous whitespace, precise geometric typography, clean border delineation, and purposeful status accents.

## Colors

The palette is tuned for high daylight visibility and rigorous visual hierarchy:

- **Primary Canvas & Surfaces:** Pure White (`#FFFFFF`) forms the base layer to maximize luminance and perceived cleanliness. Secondary elevation surfaces utilize Slate 50 (`#F8FAFC`) and Slate 100 (`#F1F5F9`) to define content containers and contextual panels without relying on heavy borders.
- **Primary Institutional Red:** Base `#DC2626` (Red 600) with a focused hover/pressed state `#B91C1C` (Red 700). Reserved strictly for high-impact actions (Report Incident, Confirm Resolution), urgent notification anchors, active validation errors, and critical map pins.
- **Neutral & Text Hierarchy:** High-contrast Dark Slate (`#1E293B`) for primary titles and readable body copy (meeting WCAG AAA standards on white surfaces). Muted Slate (`#64748B`) drives secondary metadata, timestamps, and helper text. Structural borders and hairpins utilize Slate 200 (`#E2E8F0`).
- **Operational Status Tokens:**
  - **Urgent / Pendiente:** Crimson Red (`#DC2626`, container `#FEF2F2`, border `#FECACA`).
  - **En Proceso / Asignado:** Amber (`#F59E0B`, container `#FFFBEB`, border `#FDE68A`).
  - **Resuelto / Cerrado:** Emerald (`#10B981`, container `#ECFDF5`, border `#A7F3D0`).
  - **Informativo / En Revisión:** Sky (`#0284C7`, container `#F0F9FF`, border `#BAE6FD`).

## Typography

**Plus Jakarta Sans** is employed across all hierarchy tiers. Its geometric clarity, wide aperture, and modern letterforms ensure legibility on both mobile screens under sunlight and high-density operator monitors.

- **Headlines & Metric Displays:** Rendered in bold (`700`) and extra bold (`800`) weights with slight negative letter tracking (`-0.01em` to `-0.02em`) to produce firm, authoritative anchors.
- **Body Content:** Rendered at `14px` and `16px` using regular weight (`400`) and a comfortable `1.5` line-height multiplier for sustained readability in multi-line incident descriptions.
- **Labels, Badges, and Metadata:** Rendered in semi-bold (`600`) and bold (`700`) with neutral to slightly positive tracking for instant scannability across status tags, ticket codes, and timestamps.

## Layout & Spacing

The layout is constructed on an 8-point base spatial rhythm within a fluid grid framework designed to scale from compact field smartphones up to wide-screen municipal monitoring cockpits.

- **Breakpoints:**
  - **Mobile (`< 768px`):** Single column, edge margin `1rem` (`16px`), gutter `1rem` (`16px`). Fixed bottom navigation for critical citizen reporting triggers.
  - **Tablet (`768px - 1024px`):** 6-column grid, margin `1.5rem` (`24px`), gutter `1rem` (`16px`).
  - **Desktop (`> 1024px`):** 12-column fluid grid, outer margin `2rem` (`32px`), inner column gutters `1.5rem` (`24px`), max container width capped at `1440px` for optimal scanning length.
- **Operational Split View (Desktop):** When handling dispatch or triage views, the layout utilizes a persistent 400px left incident queue list coupled with a fluid map/detail viewport to prevent cognitive context loss.

## Elevation & Depth

This system utilizes **low-contrast outlines combined with subtle ambient shadows** to preserve daylight readability and maintain crisp institutional clarity without heavy skeuomorphic effects:

- **Flat / Level 0 (Base Canvas):** Pure White (`#FFFFFF`). Content containers sit flush with subtle 1px borders of `#E2E8F0`.
- **Raised / Level 1 (Cards, Lists, Field Controls):** Background `#FFFFFF` or `#F8FAFC`, enclosed in a 1px border (`#E2E8F0`), with a soft ambient drop shadow: `0 1px 3px rgba(30, 41, 59, 0.05), 0 1px 2px rgba(30, 41, 59, 0.03)`.
- **Interactive Floating / Level 2 (Hovered Cards, Dropdowns, Popovers):** Shadow `0 10px 15px -3px rgba(30, 41, 59, 0.08), 0 4px 6px -4px rgba(30, 41, 59, 0.03)` with border `#CBD5E1`.
- **Modal & Map Flyout / Level 3 (Critical Prompts, Drawer Sheets):** Shadow `0 20px 25px -5px rgba(30, 41, 59, 0.12), 0 8px 10px -6px rgba(30, 41, 59, 0.06)`, framed against a backdrop scrim tinted at `#0F172A` with `40%` opacity.

## Shapes

The design system adopts **Rounded** primitives (`roundedness: 2`) to establish a human-centered, friendly, yet disciplined public sector tone:

- **Base Inputs & Standard Buttons:** `0.5rem` (`8px`) for sturdy tap-target definition.
- **Incident Cards, Panels, & Map Modals:** `1rem` (`16px`, `rounded-lg` / `rounded-xl`) to soften institutional data lists.
- **Feature Sheets & Hero Prompt Containers:** `1.5rem` (`24px`, `rounded-2xl`) for focused, inviting micro-interactions on mobile.
- **Status Badges, Category Filters, and Avatars:** Fully pill-shaped (`9999px`) to immediately distinguish contextual interactive tags from structural content blocks.

## Components

### Buttons
- **Primary:** Filled `#DC2626` background, white text, bold label. Hover: `#B91C1C`. Active: `#991B1B`. Height: 48px on mobile for accessibility, 40px on desktop dashboards. Border radius `8px`.
- **Secondary:** Surface `#FFFFFF`, border `1.5px` solid `#E2E8F0`, text `#1E293B`. Hover: `#F8FAFC` surface with border `#CBD5E1`.
- **Subtle / Ghost:** Transparent background, text `#64748B`, hover background `#F1F5F9`, text `#1E293B`.

### Status Badges & Chips
- Designed with high-contrast text and a softened background container:
  - **Pendiente / Urgente:** Text `#B91C1C`, surface `#FEF2F2`, 1px border `#FECACA`. Includes a pulsating 6px circular dot indicator.
  - **En Proceso:** Text `#B45309`, surface `#FFFBEB`, 1px border `#FDE68A`.
  - **Resuelto:** Text `#047857`, surface `#ECFDF5`, 1px border `#A7F3D0`.
- **Filter Chips:** Pill shape (`9999px`), padding `6px 14px`. Inactive: `#F1F5F9` with text `#64748B`. Active: `#1E293B` with white text.

### Form Inputs & Selectors
- Background `#FFFFFF`, 1px solid `#CBD5E1`, border-radius `8px`, height `44px`.
- Text `#1E293B`, placeholder `#94A3B8`.
- Focus state: border `#DC2626` with a soft 3px focus ring `rgba(220, 38, 38, 0.15)`.
- Error state: border `#DC2626`, helper text `#DC2626` with leading warning icon.

### Incident Cards
- Container: Background `#FFFFFF`, border `1px` solid `#E2E8F0`, border-radius `16px`, padding `16px`.
- Structure:
  - Top header: Category icon + neighborhood name (left), Status Chip (right).
  - Body: Incident summary title (`headline-sm`), description excerpt (`body-md`), optional photo thumbnail carousel (aspect-ratio 16:9, rounded 8px).
  - Footer: Relative timestamp ("hace 12 min"), ticket ID (`#REP-4092`), citizen vote / confirmation counter.

### Civic Specific Components
- **Map Incident Pin:** Tear-drop glyph with category icon inside. Colors correspond directly to incident urgency (`#DC2626`, `#F59E0B`, `#10B981`).
- **Geo-Location Picker Field:** Embedded interactive map banner with "Usar mi ubicación actual" quick-fill CTA.
- **Resolution Timeline:** Vertical track with 2px line (`#E2E8F0`), active segments tinted in Emerald (`#10B981`), documenting timestamped municipal validation stages (Recibido → En Cuadrilla → Resuelto).