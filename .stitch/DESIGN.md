# Design System: Your Bag - Atelier Noir
**Project ID:** 10392567449144506092

## 1. Visual Theme & Atmosphere
The Creative North Star for this design system is **"The Digital Atelier."** 
This system moves away from the rigid, boxed-in nature of traditional e-commerce templates, instead embracing the expansive, intentional layouts of high-end fashion editorials. We treat the viewport as a gallery wall. By utilizing intentional asymmetry, oversized typography, and a "tonal layering" approach to depth, we create a digital experience that feels bespoke, hyper-realistic, and exclusive. 

The goal is to let the product photography breathe. We do not "contain" content; we "curate" it. This is achieved through generous whitespace (utilizing the upper end of our spacing scale) and the total elimination of structural lines in favor of background-tonal shifts.

## 2. Color Palette & Roles
The palette is rooted in a sophisticated interplay of `surface` neutrals and `primary` depth.

* **Primary Deep Luxury** (#003b93): Primary action buttons and core brand anchors.
* **Secondary Soft Contour** (#c3c6d6 / outline_variant): "Ghost Border" used exclusively for faint division without harsh edges.
* **Surface Base** (#fbf9f8): The absolute base layer. Creamy off-white paper feel.
* **Surface Lift** (#f6f3f2 / surface_container_low): Used for gentle grouping backgrounds over the base texture.
* **Surface Floating** (#ffffff / surface_container_lowest): Soft, natural "lift" for cards and modals.
* **Elevated Interaction** (#eae8e7 / surface_container_high): Hover states and active selections.
* **Primary Text Authority** (#1b1c1c / on_surface): Main typography for sharp readability.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts or whitespace. Contrast is created through tonal weight, not outlines.

## 3. Typography Rules
The typographic identity relies on the tension between the classic authority of **Noto Serif** and the modern, technical precision of **Manrope**.

- **Display & Headlines (Noto Serif):** Used for brand storytelling, collection titles, and high-level editorial headers. The serif adds a "legacy" feel, suggesting craftsmanship. (e.g. Display-LG at 3.5rem with tight letter-spacing -0.02em).
- **Titles & UI (Manrope):** Used for product names, navigation, and functional labels. 
- **Monospace Accents:** Use the system monospace font for technical details (SKUs, sizing, "Limited Edition" tags) at `label-sm` scale.

## 4. Component Stylings
* **Buttons:** 
  - **Primary:** Gradient (`primary` to `primary-container` #0051c3), white text, `0.25rem` (ROUND_FOUR) roundedness. Padding: `1rem 2.75rem` (Spacing 3 & 8).
  - **Secondary:** Transparent background with a `Ghost Border` (#c3c6d6).
  - **Tertiary:** Text only, `label-md`, with a 1px underline that expands on hover.
* **Cards/Containers:** 
  - **Corners:** Gently rounded corners (`ROUND_FOUR`).
  - **Shadows:** Avoid traditional drop shadows. Use **Tonal Layering** (place `#ffffff` on `#f0eded`). If a floating element needs a shadow, use an "Ambient Shadow" `0px 24px 48px rgba(27, 28, 28, 0.06)` utilizing the text color, not pure black. 
  - **Interaction:** On hover, the card background should shift from `surface` to `surface-container-low`, and the product image should subtly scale (1.05x) over 400ms.
* **Inputs/Forms:** Minimalist bottom-border only (`outline-variant` at 20%). On focus, the border transitions to `primary`.

## 5. Layout Principles
### Glass & Gradient Rule
Floating elements (modals, sticky headers) should utilize **Glassmorphism**: Background `surface` at 80% opacity with a `backdrop-blur` of 20px. 

### The "Editorial Reveal"
For collection lookbooks, use an asymmetrical grid where images overlap. The text (`headline-lg`) should partially overlay the image using a `backdrop-blur` container to ensure legibility while maintaining the "layered" aesthetic. 
Do not use dividers between product items. Use massive whitespace (`spacing-10` / 3.5rem) to create clear visual distinction.
