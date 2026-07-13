---
name: A&A Inmobiliaria — Admin Panel
description: Internal catalog/CRM console for a Honduran real estate brokerage — quiet, precise, one gold mark per screen.
colors:
  obsidian-950: "#0A0A0B"
  obsidian-900: "#111113"
  obsidian-800: "#1A1A1D"
  obsidian-700: "#26262B"
  obsidian-600: "#36363D"
  obsidian-500: "#5A5A63"
  gold-50:  "#FBF6E9"
  gold-100: "#F2E4B8"
  gold-200: "#E6CE84"
  gold-300: "#D4B254"
  gold-400: "#B8962E"
  gold-500: "#8C6F1C"
  gold-600: "#5E4A11"
  bone-50:  "#FAF8F3"
  bone-100: "#F3EFE6"
  bone-200: "#E6E0D2"
  bone-300: "#C9C2B1"
  bone-400: "#9A9383"
  success:    "#4A7C59"
  success-bg: "#E8F0EA"
  warning:    "#B8862E"
  warning-bg: "#FBF1D9"
  danger:     "#8C3A2E"
  danger-bg:  "#F3E0DB"
  info:       "#2E5C8C"
  info-bg:    "#DCE7F3"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Plus Jakarta Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "20px"
  full: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.obsidian-900}"
    textColor: "{colors.bone-50}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.obsidian-800}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.obsidian-500}"
    rounded: "{rounded.md}"
  chip-active:
    backgroundColor: "{colors.gold-300}"
    textColor: "{colors.obsidian-900}"
    rounded: "{rounded.md}"
    padding: "6px 13px"
  chip-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.obsidian-500}"
    rounded: "{rounded.md}"
    padding: "6px 13px"
---

# Design System: A&A Inmobiliaria — Admin Panel

## 1. Overview

**Creative North Star: "The Private Office"**

This is the back office, not the storefront. Nobody outside A&A's own staff ever sees it, which is exactly why it has to feel expensive: the quality of a tool nobody has to impress is the truest signal of how seriously the business takes itself. The reference is Linear and the Stripe dashboard, not a real-estate SaaS template — typography weight and spacing carry the hierarchy, and color is nearly silent until the one moment it needs to speak.

Gold (`#D4B254`) is the brand's only decoration, and it is spent on exactly one thing per screen: the primary action, or the active state of a single control. Everywhere else the interface is obsidian, bone, and the neutral grays between them. This is a deliberate reversal from the panel's previous state, where gold outlined every chip, every toggle, every badge, and read as noise instead of signal.

Density stays low. Tables show data, not decoration. A screen with three cards feels calmer than a screen with twelve, and this system prefers that calm.

**Key Characteristics:**
- One gold accent per screen, never more.
- Hierarchy from type weight and spacing, not from color or borders.
- Flat surfaces at rest; elevation only appears in response to interaction.
- Identical light and dark execution — dark is not the "real" theme with light as an afterthought.

## 2. Colors

The palette is almost monochrome on purpose: obsidian and bone carry everything, gold marks the one thing that matters.

### Primary
- **Polished Gold** (`#D4B254`): the single accent. Reserved for the primary button, the active nav item, the active filter tab, a focused input's border. Never applied to more than one element class per screen.

### Neutral
- **Obsidian** (`#111113` dark bg / `#0A0A0B` sidebar): base surface in dark mode, and the ink color for text in light mode.
- **Obsidian Card** (`#1A1A1D`): dark-mode surface one step up from the page background.
- **Obsidian Line** (`#26262B`): dark-mode border/divider.
- **Bone** (`#FAF8F3`): base page background in light mode.
- **Bone Card** (`#FFFFFF`): light-mode surface.
- **Bone Line** (`#E6E0D2`): light-mode border/divider.
- **Ash** (`#5A5A63` dark text-muted / `#9A9383` dim): secondary and tertiary text in both themes.

### Semantic
- **Success** (`#4A7C59` on `#E8F0EA`): disponible, saved, confirmed.
- **Warning** (`#B8862E` on `#FBF1D9`): apartado, pending.
- **Danger** (`#8C3A2E` on `#F3E0DB`): vendido-as-error-context, delete actions.
- **Info** (`#2E5C8C` on `#DCE7F3`): informational states.

### Named Rules
**The One Mark Rule.** Gold appears once per screen: the primary CTA, or the active tab, or the active nav item. If two elements on the same screen are both gold, remove the accent from one of them. Semantic colors (success/warning/danger/info) are not gold and do not count against this budget — they exist to report state, not to decorate it.

## 3. Typography

**Display Font:** Plus Jakarta Sans (with -apple-system, Segoe UI, Roboto fallback)
**Label/Mono Font:** JetBrains Mono, for numeric/code contexts only (prices, IDs)

**Character:** A single geometric-humanist sans carries the whole system. Weight and size do the work a second typeface would otherwise do — 700 for anything that needs to be found first, 500-600 for everything a user reads carefully, 600 with wide tracking for labels that behave like signage.

### Hierarchy
- **Display** (700, 2rem, -0.025em tracking): page titles ("Propiedades", "Editar propiedad").
- **Title** (700, 1.125rem): section headers within a page, card titles.
- **Body** (500, 0.8125rem): table cells, form values, the default reading size.
- **Label** (600, 0.6875rem, 0.08em tracking, uppercase): eyebrows, field labels, table column headers.

### Named Rules
**The No Second Typeface Rule.** Never introduce a second font family for "emphasis." Weight and size are the only levers.

## 4. Elevation

Flat by default, tonal panels for structure, shadow only as a response to interaction — never as ambient decoration sitting under a static card. A card at rest has a 1px border and nothing else; it earns a shadow only on hover or when it's actively being dragged/focused.

### Shadow Vocabulary
- **xs** (`0 1px 2px rgba(17,17,19,0.04)`): barely-there separation, used under dropdowns at rest.
- **sm** (`0 2px 6px rgba(17,17,19,0.06), 0 1px 2px rgba(17,17,19,0.04)`): resting elevation for popovers.
- **md** (`0 8px 20px -8px rgba(17,17,19,0.12), 0 2px 6px rgba(17,17,19,0.06)`): hover state for primary buttons and interactive cards.
- **lg** (`0 18px 40px -16px rgba(17,17,19,0.18), 0 4px 12px rgba(17,17,19,0.08)`): drawers, modals.
- **xl** (`0 32px 64px -24px rgba(17,17,19,0.28), 0 8px 20px rgba(17,17,19,0.10)`): the full-height property editor drawer.

### Named Rules
**The Earned Shadow Rule.** No shadow exists at rest unless the element floats above the page (a drawer, a modal, a dropdown). A card sitting in the normal document flow gets a border, not a shadow. Shadows never carry color; `rgba(17,17,19,…)` regardless of theme, never a gold-tinted glow.

## 5. Components

### Buttons
- **Shape:** 8px radius (`rounded-md`) on every variant, no exceptions. Never full-pill.
- **Primary:** obsidian background (`#111113` / `#1A1A1D` dark, same in light), bone text, 12px/20px padding. Hover darkens the fill by one step and lifts 1px with a neutral `shadow-md` — no colored glow.
- **Ghost:** transparent, ash text, darkens to ink text on hover. Used for secondary actions like "Cancelar."
- **Destructive:** transparent with a 1px danger-toned border, danger text; background tints to a faint danger wash on hover. Reserved for delete actions only.

### Chips (filter tabs, toggles)
- **Shape:** 8px radius, matching buttons — chips are buttons, not tags.
- **Inactive:** transparent background, 1px neutral border, ash text.
- **Active:** gold fill, obsidian text, gold border. This is the one gold element on a filter row; every other chip in the row stays neutral.
- **Status tags** (Disponible, Contado, etc. — non-interactive labels on cards): these are the one place a pill (999px) shape is correct, because they read as tags, not controls. Background is the semantic tint (success-bg, warning-bg, etc.), never gold.

### Cards / Containers
- **Corner Style:** 12-14px radius for dashboard/stat cards, 8px for anything nested inside another surface (nested cards should be avoided; if unavoidable, the inner surface drops the border and uses only a background tint to differentiate).
- **Background:** obsidian-800 dark / white light.
- **Shadow Strategy:** none at rest (see Elevation); border only.
- **Border:** 1px, obsidian-700 dark / bone-200 light.
- **Internal Padding:** 20-24px.

### Inputs / Fields
- **Style:** 1px neutral border, 8px radius, transparent/surface background.
- **Focus:** border shifts to gold (`#D4B254`), no glow ring. This is a legitimate second gold touchpoint because it only exists while the field is actively focused — it disappears the instant focus moves on, so it never competes with the screen's one persistent gold mark.
- **Error:** border shifts to danger, helper text in danger color below the field.

### Navigation
- Obsidian sidebar (`#0A0A0B`) in both themes — the sidebar does not follow the light/dark toggle, it is always dark, the way a concierge desk stays the same regardless of the room's lighting.
- Inactive items: ash text, no background.
- Active item: gold text, subtle gold-tinted background wash, and a 3px solid gold indicator bar on the leading edge (the one navigation exception to "no side-stripes," because it marks a single always-on state rather than decorating a repeated list).

## 6. Do's and Don'ts

### Do:
- **Do** spend gold once per screen: the primary action or the single active state. Everywhere else, obsidian/bone/ash.
- **Do** use 8px radius on every interactive control — buttons, chips, inputs, toggles.
- **Do** let a focused input's gold border be the exception that proves the rule: it's transient, not persistent.
- **Do** keep both themes equally finished. Test every screen in light and dark before calling it done.
- **Do** use semantic colors (success/warning/danger/info) for state, never gold for state.

### Don't:
- **Don't** outline every chip, badge, and toggle in gold. That reads as a generic free-SaaS admin template, the explicit anti-reference from PRODUCT.md.
- **Don't** use `border-radius: 999px` on anything a user clicks as an action. Full-pill is reserved for static status tags only.
- **Don't** attach a colored (gold) shadow to any element. Shadows are always neutral obsidian-tinted, regardless of theme.
- **Don't** add a shadow to a card at rest. Shadows are earned by floating above the page (drawers, modals, dropdowns), not by sitting in the normal flow.
- **Don't** build dense, undifferentiated tables. Every table needs a clear label row, generous row height, and no more than one semantic color per row.
- **Don't** introduce a second typeface "for emphasis." Plus Jakarta Sans's weight range is the only lever.
