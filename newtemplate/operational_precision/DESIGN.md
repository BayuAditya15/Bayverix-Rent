---
name: Operational Precision
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
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1700'
  on-tertiary-container: '#b87500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-md-medium:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm-medium:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-6: 24px
  space-8: 32px
  container-padding-mobile: 16px
  container-padding-tablet: 24px
  container-padding-desktop: 32px
  gutter-desktop: 16px
  gutter-mobile: 12px
---

## Brand & Style

This design system is engineered for high-density, mission-critical rental management operations. The visual posture reflects modern B2B SaaS benchmarks—specifically drawing from the utility, quiet confidence, and ruthless clarity found in Linear and Stripe Dashboard architectures.

### Brand Personality & Emotional Impact
- **Utilitarian Discipline:** The UI operates as a calibrated tool rather than a consumer canvas. Visual weight is strictly reserved for actionable signals, dynamic state changes, and primary actions.
- **Calm Operational Velocity:** Fast scanning, zero decorative friction, and immediate affordances. Property managers, fleet dispatchers, and equipment operations leads feel total situational awareness and precision control.
- **Systematic Trust:** Neutral-first foundation where elements sit cleanly in a predictable hierarchy, minimizing cognitive fatigue over multi-hour working shifts.

### Design Movement
- **Modern Utilitarian Minimalist:** Low-noise surfaces, deliberate 1px structural framing, high-contrast text rendering, and semantic status isolation.

## Colors

The palette is engineered around a neutral slate foundation. Chromatic saturation is systematically quarantined to operational statuses and explicit action vectors.

### Surface & Border Foundations
- **Base Canvas (`surface-ground`):** `#F8FAFC` (Slate-50)
- **Layer 1 Surface (`surface-panel`):** `#FFFFFF` (Solid white containers and card panels)
- **Layer 2 Raised / Header (`surface-subtle`):** `#F1F5F9` (Slate-100)
- **Border Subtle (Structure):** `#E2E8F0` (Slate-200, 1px default)
- **Border Strong (Inputs / Interactive States):** `#CBD5E1` (Slate-300)
- **Border Divider:** `#F1F5F9` (Slate-100)

### Typographic Contrast
- **Text Primary:** `#0F172A` (Slate-900)
- **Text Secondary:** `#475569` (Slate-600)
- **Text Muted / Placeholder:** `#94A3B8` (Slate-400)
- **Text Inverted:** `#FFFFFF`

### Operational Status Mapping
Status indicators must pair their respective background tint with a high-contrast text and border value to guarantee WCAG AAA compliance:
- **DRAFT:** Neutral slate badge. Surface: `#F1F5F9` (Slate-100), Text: `#475569` (Slate-600), Border: `#E2E8F0` (Slate-200).
- **PENDING:** Action required / awaiting confirmation. Surface: `#FEF3C7` (Amber-100), Text: `#B45309` (Amber-700), Border: `#FDE68A` (Amber-200).
- **CONFIRMED:** Scheduled rental contract. Surface: `#EFF6FF` (Blue-50), Text: `#1D4ED8` (Blue-700), Border: `#BFDBFE` (Blue-200).
- **ONGOING:** Asset currently deployed/in-use. Surface: `#DBEAFE` (Blue-100), Text: `#1E40AF` (Blue-800), Border: `#93C5FD` (Blue-300), Pulse Indicator: `#2563EB` (Blue-600).
- **COMPLETED:** Successful return/reconciliation. Surface: `#ECFDF5` (Emerald-50), Text: `#047857` (Emerald-700), Border: `#A7F3D0` (Emerald-200).
- **CANCELLED:** Voided/disputed inventory. Surface: `#FEF2F2` (Red-50), Text: `#B91C1C` (Red-700), Border: `#FECACA` (Red-200).

## Typography

Typography relies on a systematic implementation of Inter across all operational modules, with JetBrains Mono dedicated exclusively to SKU identifiers, currency aggregates, timestamps, and tracking serials.

### Typographic Guidelines
- Use tabular figures (`font-variant-numeric: tabular-nums`) across all numerical metrics, financial tables, inventory logs, and balance columns.
- Sub-headings and table headers leverage `label-sm` with explicit uppercase casing and a `+0.04em` tracking offset for immediate spatial separation from row content.
- Restrict line lengths for descriptive text blocks to a maximum of 68 characters to preserve scan speed across wide management consoles.

## Layout & Spacing

The layout is built on an exact 4px mathematical scale, enforcing dense information presentation without visual overcrowding.

### Spacing Philosophy
- `space-1` (4px): Icon-to-label gaps, internal badge padding, inline status dots.
- `space-2` (8px): Form input inner vertical padding, compact table cell margins, chip horizontal spacing.
- `space-3` (12px): Default input horizontal padding, button horizontal inset, list row separation.
- `space-4` (16px): Card internal padding, structural grid gutters on desktop dashboards.
- `space-6` (24px): Sectional module spacing, modal header/footer offsets.
- `space-8` (32px): Primary workspace boundary padding and dashboard view split gutters.

### Grid & Responsiveness
- **Mobile (< 768px):** Single-column stack. Side navigation collapses into an off-canvas drawer or bottom action bar. Margins are fixed to `16px`. Tables convert to vertical stacked metadata cards.
- **Tablet (768px - 1023px):** Fluid multi-column layout with 8-column grid. Collapsible persistent mini-rail (64px width). Margins fixed to `24px`.
- **Desktop (1024px+):** Fluid 12-column grid with a fixed 240px primary navigation sidebar and a flexible data canvas spanning up to 1600px max width. Split-view panel (inspector drawer) opens on the right at a fixed 380px without shifting base grid columns.

## Elevation & Depth

Visual separation relies on structural boundaries rather than deep blur shadows. This matches Stripe and Linear’s razor-sharp dashboard feel.

### Layer Hierarchy
- **Canvas Base (Level 0):** Pure slate ground (`#F8FAFC`). No borders, no shadows.
- **Card / Surface Default (Level 1):** Solid `#FFFFFF` fill bounded by a crisp `1px solid #E2E8F0`. Elevation shadow is minimal: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Raised Interactive / Hover (Level 2):** Subtle upward push: `0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`. Border shifts to `#CBD5E1`.
- **Overlays / Flyouts / Dropdowns (Level 3):** Fixed modals, popovers, and contextual dropdowns use: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` combined with an explicit border `1px solid #E2E8F0`.
- **Global Modal Backdrop:** `#0F172A` at `40%` opacity (`rgba(15, 23, 42, 0.40)`) with an ultra-light `backdrop-filter: blur(2px)` to maintain context while focusing action.

## Shapes

The geometric framework establishes a balanced `rounded-lg` profile across functional primitives, maintaining industrial software ergonomics.

### Implementation Specs
- **Default Container Radius (`rounded-lg`):** `8px` (`0.5rem`). Applied to cards, panels, modal viewports, and action sheets.
- **Micro Primitives (`rounded-md`):** `6px` (`0.375rem`). Applied to standard buttons, text input fields, selection menus, tooltips, and badges.
- **Interactive Toggles & Dots:** Full circle (`9999px`) reserved strictly for status pills, avatars, switch toggles, and radio controls.
- **Table Outlines:** Outer wrapper inherits `8px` radius with clipped borders (`overflow: hidden`). Internal cells do not utilize border radiuses.

## Components

### Buttons
- **Primary:** Solid `#0F172A` background, `#FFFFFF` text, `6px` radius. Subtle inset shadow: `inset 0 1px 0 rgba(255, 255, 255, 0.15)`. Hover: `#1E293B`.
- **Secondary:** Surface `#FFFFFF`, text `#0F172A`, border `1px solid #CBD5E1`. Hover: `#F8FAFC`. Active: `#F1F5F9`.
- **Destructive:** Border `1px solid #FECACA`, surface `#FFFFFF`, text `#B91C1C`. Hover: `#FEF2F2`.
- **Sizes:** Compact (height 32px, px 12px, font 13px), Standard (height 36px, px 16px, font 13px).

### Input Fields & Controls
- **Text Inputs:** Height 36px, border `1px solid #CBD5E1`, background `#FFFFFF`, font-size 13px. Focus state: `1px solid #2563EB` with an external focus ring `0 0 0 3px rgba(37, 99, 235, 0.12)`.
- **Checkboxes & Radios:** 16px × 16px boxes. Border `1px solid #94A3B8`. Checked state: `#0F172A` fill with crisp white vector marks.

### Badges & Status Chips
- Height 22px, padding horizontal 8px, border radius 4px (`rounded-md`).
- Must include an integrated 6px circular indicator dot aligned to the left of the uppercase label.
- Renders the designated palette specs: DRAFT (Slate), PENDING (Amber), CONFIRMED (Blue), ONGOING (Blue with pulsing dot), COMPLETED (Green), CANCELLED (Red).

### Data Tables (Operational Workhorse)
- **Header:** Background `#F8FAFC`, height 36px, text `label-sm` (`#64748B`), bottom border `1px solid #E2E8F0`.
- **Row:** Height 44px (compact) or 52px (standard). Border bottom `1px solid #F1F5F9`. Hover row: `#F8FAFC`. Selected row: `#EFF6FF`.
- Numerical and tracking data aligned strictly right with mono font styling. Status badges aligned center or left.

### Action Drawer / Rental Inspector Panel
- Contextual slide-over drawer anchored to the right viewport. Width: 420px desktop, 100vw mobile.
- Background `#FFFFFF`, left border `1px solid #E2E8F0`.
- Divided into structured vertical segments: Asset Metadata Header, Rental Timeline Stepper, Customer Log, Financial Breakdown, and Fixed Footer Actions.