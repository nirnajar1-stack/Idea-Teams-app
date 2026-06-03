---
name: Fluid Precision
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
  on-surface-variant: '#414755'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#605e5f'
  on-secondary: '#ffffff'
  secondary-container: '#e3dedf'
  on-secondary-container: '#646263'
  tertiary: '#555d63'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e757c'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e6e1e2'
  secondary-fixed-dim: '#cac5c6'
  on-secondary-fixed: '#1c1b1c'
  on-secondary-fixed-variant: '#484647'
  tertiary-fixed: '#dce3eb'
  tertiary-fixed-dim: '#c0c7cf'
  on-tertiary-fixed: '#151c22'
  on-tertiary-fixed-variant: '#40484e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-subtle: '#F8FAFC'
  success-vibrant: '#10B981'
  border-light: '#E2E8F0'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system embodies a **Modern Corporate** aesthetic tailored for the high-end FinTech sector. It prioritizes clarity, reliability, and technical sophistication. The visual narrative is built on the tension between expansive whitespace and high-precision UI elements.

The style leverages a "Soft-Minimalist" approach:
- **Trust-Centric:** Uses a stable, structured layout to evoke institutional security.
- **High-End Utility:** Employs subtle depth and premium typography to differentiate from basic consumer apps.
- **Accessible Flow:** Focuses on clear paths to action through high-contrast primary touchpoints and calm, pastel-tinted secondary surfaces.

## Colors

The palette is anchored by a vibrant **Electric Blue** primary color, signifying action and digital native intelligence. 

- **Primary & Action:** Used exclusively for high-priority interactive elements, progress indicators, and brand moments.
- **Deep Slate/Black:** Utilized for primary headings and core UI text to ensure maximum legibility and a "premium ink" feel.
- **Tonal Backgrounds:** The system relies on a tiered background strategy. `surface-subtle` is used for large page sections, while `tertiary` (soft blue tint) is used to group related functional components or highlight specific cards.
- **Functional Neutrals:** Slate-based grays are used for borders and secondary labels to maintain a cool, professional temperature throughout the interface.

## Typography

This system uses a dual-font strategy to balance personality with utility. 

**Plus Jakarta Sans** is the display typeface, chosen for its friendly yet geometric structure. It should be used for all headlines and large titles to provide a modern, welcoming brand voice. 

**Inter** serves as the workhorse typeface for all body copy, inputs, and data. Its neutral, highly legible character is essential for the information-dense environments typical of FinTech applications. 

- **Scale:** Use tight tracking (negative letter spacing) on large headings to keep the aesthetic "tucked-in" and professional.
- **Hierarchy:** Rely on weight shifts (SemiBold to Bold) rather than just size to denote importance in data tables and forms.

## Layout & Spacing

The design system utilizes a **Fixed Grid** approach for desktop content to maintain focus and control, transitioning to a **Fluid Grid** for mobile devices.

- **The 8px Rule:** All dimensions, padding, and margins must be multiples of 8px. 
- **Generous Gaps:** Vertical rhythm is intentionally airy. Use larger gaps (40px+) between major sections to prevent visual fatigue.
- **Grid Structure:** A 12-column grid on desktop, 8-column on tablet, and 4-column on mobile.
- **Alignment:** Consistent left-alignment for all text blocks and forms to reinforce a sense of order and reliability.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** supplemented by **Ambient Shadows**. This creates a sense of "soft stacks" rather than floating elements.

- **Base Layer:** The `surface-subtle` background.
- **Mid Layer (Cards):** Pure `#FFFFFF` surfaces with a very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)).
- **Top Layer (Modals/Popovers):** Higher contrast shadows (0px 10px 30px rgba(0, 0, 0, 0.1)) to draw focus.
- **The "Glass" Exception:** For navigation bars or floating action bars, a subtle backdrop blur (12px) with a semi-transparent white fill creates a modern, lightweight feel.

## Shapes

The shape language is consistently **Rounded**. This softens the "industrial" nature of financial data, making the product feel more accessible and user-friendly.

- **Standard Elements:** Buttons and input fields use a `0.5rem` radius.
- **Large Containers:** Cards and main content areas use `1rem` (rounded-lg) to create a distinct, nested look.
- **Icons:** Should follow the same logic—avoiding sharp corners in favor of 2px or 3px corner radii.

## Components

### Buttons
- **Primary:** Solid `primary_color_hex` with white text. No border. High-contrast and impactful.
- **Secondary:** Ghost style—`border-light` with `secondary_color_hex` text. Changes to a subtle gray fill on hover.
- **Tertiary:** Text-only with an chevron icon, used for "Learn More" or "View All" links.

### Cards
- Always white backgrounds.
- Borders should be 1px solid `border-light`. 
- Internal padding should be generous (24px or 32px).

### Input Fields
- Use a soft gray background (`surface-subtle`) instead of a white background to differentiate from the card surface.
- Focus state is a 2px solid `primary_color_hex` border.
- Labels are consistently `label-md` in `secondary_color_hex`.

### Chips & Badges
- Used for status (e.g., "Pending", "Completed").
- Use a "Soft Tint" style: a pale version of the status color for the background with a high-contrast saturated version for the text.
- Fully pill-shaped (rounded-full).

### Lists
- Separated by thin `border-light` dividers.
- Hover states use `tertiary_color_hex` to highlight the row without being jarring.