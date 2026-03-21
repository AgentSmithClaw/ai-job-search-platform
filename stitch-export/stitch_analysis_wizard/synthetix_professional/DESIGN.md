# Design System Document: The Precision Curator

## 1. Overview & Creative North Star
The "Precision Curator" is a design system built for high-stakes decision-making. While the prompt calls for the functional efficiency of Linear and the spatial clarity of Notion, this system moves beyond those utilities by introducing **Atmospheric Intelligence**. 

Our Creative North Star is **"The Digital Architect."** We treat the dashboard not as a flat screen, but as a structured, three-dimensional workspace. We break the "SaaS template" look by using intentional white space as a structural element and prioritizing a high-contrast typography scale that feels more like a premium editorial magazine than a database. 

The goal is to transform "Job Gap Analysis" from a stressful data dump into a serene, guided experience through **Tonal Layering** and **Bespoke Asymmetry**.

---

## 2. Colors: The Atmospheric Palette
We utilize a sophisticated spectrum of Indigos and Lavenders to create a workspace that feels calm yet authoritative.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for defining primary layout sections. Structure must be achieved through **Background Shifts**. 
*   **The Canvas:** Use `background` (#fcf8ff).
*   **The Work Area:** Use `surface_container_low` (#f5f2ff) to define the main dashboard body against the canvas.
*   **The Utility Bar:** Use `surface_container_highest` (#e4e1ee) for sidebars or top-level navigation to provide a grounded "anchor."

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
1.  **Level 0 (Base):** `surface` (#fcf8ff)
2.  **Level 1 (Sections):** `surface_container` (#f0ecf9)
3.  **Level 2 (Active Cards):** `surface_container_lowest` (#ffffff) — This creates a "lift" effect using pure white against the off-white background.

### The "Glass & Signature" Rule
*   **Glassmorphism:** For floating modals or dropdowns, use `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur. 
*   **Signature Textures:** For high-impact areas (like "Analysis Complete" states), apply a subtle linear gradient: `primary_container` (#4f46e5) to `primary` (#3525cd) at a 135-degree angle.

---

## 3. Typography: Editorial Authority
We use **Inter** exclusively. To avoid a "generic" look, we lean into extreme scale differentials.

*   **Display & Headline:** Use `display-md` (2.75rem) for the primary "Gap Score." Track it at `-0.02em` for a tight, high-end feel.
*   **Titles:** Use `title-lg` (1.375rem) for card headers. These should be `Medium` or `SemiBold` to contrast against the lighter body text.
*   **The "Context" Label:** Use `label-sm` (0.6875rem) in uppercase with `0.05em` letter spacing for metadata (e.g., "LAST UPDATED").
*   **Hierarchy Note:** Always pair a `headline-sm` with a `body-md` in `on_surface_variant` (#464555) to ensure the secondary information recedes visually, allowing the data to breathe.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are a last resort. We define depth through color and light physics.

### The Layering Principle
Instead of a shadow, place a `surface_container_lowest` card inside a `surface_container` section. The contrast between the pure white and the tinted lavender creates a "natural lift."

### Ambient Shadows
If a floating element (like a Command Menu) requires a shadow, use:
*   **Color:** `on_surface` (#1b1b24) at 6% opacity.
*   **Blur:** `32px`
*   **Spread:** `0px`
*   **Y-Offset:** `12px`
This mimics a soft overhead studio light rather than a harsh digital shadow.

### The "Ghost Border" Fallback
If contrast is needed for accessibility (e.g., an input field), use a **Ghost Border**: `outline_variant` (#c7c4d8) at **20% opacity**. This provides a guide for the eye without "trapping" the content in a box.

---

## 5. Components: Functional Elegance

### Buttons
*   **Primary:** `primary_container` (#4f46e5) background with `on_primary` (#ffffff) text. Use `0.5rem` (8px) roundedness. Apply a subtle inner-glow (1px white at 10% opacity) on the top edge to simulate a physical edge.
*   **Secondary:** No background. Use `primary` (#3525cd) text and a **Ghost Border**.

### AI Analysis Cards
*   **No Dividers:** Prohibit the use of horizontal lines. To separate "Required Skill" from "Current Level," use a `2.5` (0.5rem) spacing gap and a background shift to `surface_container_high`.
*   **Progress Bars:** Use `primary` for the fill and `surface_container_highest` for the track. The track should be thin (4px) to remain minimalist.

### Input Fields
*   **State:** Standard fields use `surface_container_low`. On focus, transition to `surface_container_lowest` with a `primary` Ghost Border. 
*   **Error State:** Use `error` (#ba1a1a) only for the text and a 10% opacity `error_container` fill for the box.

### Signature Component: The "Gap Gauge"
A custom visualization using `tertiary` (#7e3000) for "Missing Skills" and `primary` (#3525cd) for "Matched Skills." This high-contrast pairing ensures the user's attention is immediately drawn to the deficit.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. A wide column for the analysis results (70%) and a narrow column for metadata (30%) creates a modern, editorial feel.
*   **Do** use `16` (3.5rem) of vertical spacing between major sections to allow the user's eyes to "reset."
*   **Do** use `primary_fixed_dim` for subtle icon backgrounds to make them feel integrated.

### Don’t
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#1b1b24).
*   **Don't** use 1px solid borders to create a grid. If the layout feels messy, increase the `spacing` tokens instead of adding lines.
*   **Don't** use standard "Success Green." Use the Indigo `primary` for everything "correct" to maintain a monochrome, professional aesthetic. Use `error` sparingly and only for critical gaps.