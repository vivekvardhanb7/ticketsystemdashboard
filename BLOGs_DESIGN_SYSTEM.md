# Blog Page Design System

## Purpose

This document is the **single source of design instructions** for an AI coding agent creating future blog pages.  
Every value in this file was extracted from the existing source code in the `Blog/` directory.  
**Do not guess. Do not redesign. Follow these rules exactly.**

---
## 🤖 MASTER AI IMPLEMENTATION DIRECTIVE

**THIS SECTION IS MANDATORY. READ IT BEFORE GENERATING OR MODIFYING ANY BLOG PAGE.**

This Markdown file is the **single source of truth** for the existing blog design. The AI must reproduce the existing design exactly.

### 1. DO NOT REDESIGN

* Do **not** modernize the design.
* Do **not** improve the UI based on personal judgment.
* Do **not** introduce a new visual style.
* Do **not** change colors, spacing, typography, layout, breakpoints, borders, shadows, sizing, or component behavior unless explicitly required by this document.
* Do **not** make assumptions when a value is not specified.
* If something is unclear, inspect the existing project/source files listed in this document before deciding.

### 2. THIS FILE OVERRIDES AI DEFAULTS

When generating code:

**This design system > existing project patterns > generic MUI/React conventions > AI assumptions.**

Never replace a documented implementation with what the AI considers "better", "cleaner", "more modern", or "best practice."

### 3. EXISTING DESIGN MUST BE REUSED

Before creating a new blog page, inspect and reuse the existing:

* Header
* Footer
* Blog components
* CSS classes
* Typography classes
* Design tokens
* MUI `sx` patterns
* Responsive breakpoints
* Blog card structure
* Author/social component
* Back button
* Comment form
* Related blogs structure

Do **not** recreate an existing component.



### 5. NO INVENTED VALUES

**NEVER invent:**

* Colors
* Font families
* Font sizes
* Font weights
* Line heights
* Letter spacing
* Margins
* Padding
* Widths
* Heights
* Border radius
* Borders
* Shadows
* Breakpoints
* Grid definitions
* Image dimensions
* Component behavior

If a value is not specified, inspect the existing source implementation before introducing one.

### 6. CSS MUST FOLLOW THE EXISTING DESIGN

Use the existing CSS files and classes documented in this MD as the source of truth.

* Reuse existing CSS classes exactly.
* Do **not** create new CSS classes or new CSS files.
* Do **not** modify existing CSS unless explicitly requested.
* Follow the documented CSS properties, values, and responsive rules exactly.
* Use MUI `sx` only where the existing implementation uses `sx`.
* If a CSS value is not documented, inspect the existing project CSS before deciding.
* Do not replace existing CSS with Tailwind, inline CSS, styled-components, or another styling system.

For genuinely new visual structures, use the documented MUI `sx` approach instead of creating new CSS classes.


### 7. NO NEW WRAPPER COMPONENTS

Do not create custom components such as:

```jsx
<Text />
<Heading />
<Section />
<Container />
<Figure />
<BlogHero />
<BlogContent />
```

unless the component already exists in the project and is explicitly documented in this file.

Use the existing components and direct `Typography`, `Box`, and HTML elements according to the documented structure.

### 8. PRESERVE HTML STRUCTURE

Do not replace required plain HTML elements with MUI equivalents.

For example:

```jsx
<div className="blog-details-page">
<main className="blog-main-article">
<section className="technical-section">
<hr className="target-divider" />
<ul className="blog-check-list">
```

These structures must remain exactly as documented.

### 9. TRANSLATION IS MANDATORY

Every user-facing string must use:

```jsx
t("translation.key")
```

Never hardcode article content directly inside JSX.

Never use:

```jsx
t("translation.key", {
  defaultValue: "..."
})
```

Create/update the appropriate translation JSON instead.

### 10. DO NOT COPY EXISTING ARTICLE CONTENT

Existing blog pages are used as **design references**, not as content templates.

When creating a new blog:

* Reuse the structure.
* Reuse the styling.
* Reuse the components.
* Reuse the documented layout patterns.

Do **not** copy the actual article text from another blog unless explicitly requested.

### 11. RESPONSIVE DESIGN IS NOT OPTIONAL

The generated page must follow all responsive rules documented in this file.

Do not create a desktop-only implementation and assume it will automatically work on mobile.

Test/consider the documented viewport sizes, especially:

```text
320px
360px
375px
390px
414px
480px
600px
768px
900px
1024px
1280px
1440px
1600px
1920px
2560px
```

### 12. DO NOT CHANGE IMAGE BEHAVIOR

Images must follow the documented image system.

Do not:

* Stretch images.
* Squash images.
* Use `object-fit: fill`.
* Replace `object-fit: cover` with `contain`.
* Introduce arbitrary fixed image dimensions.
* Change documented responsive image behavior.

### 13. REQUIRED COMPONENTS MUST NOT BE OMITTED

Every blog detail page must contain the documented:

```jsx
<BlogBackButton />
<BlogSocialAuthor />
<BlogcommentForm />
```

and the Related Blogs section.

Do not remove them because they are not part of the article content.

### 14. DO NOT MODIFY SHARED COMPONENTS UNNECESSARILY

When creating a new blog page, do not modify:

* Header
* Footer
* BlogCard
* BlogBackButton
* BlogSocialAuthor
* BlogCommentForm
* Existing global typography
* Existing blog CSS

unless the task explicitly requires modifying those shared components.

### 15. FOLLOW THE EXACT CODE TEMPLATE

If this document provides an **EXACT CODE TEMPLATE**, use it as the starting structure.

Do not reorganize the structure merely because another organization appears cleaner.

Only replace:

* Blog-specific translation keys
* Blog-specific images
* Blog-specific data
* Blog-specific article sections
* Blog-specific author information
* Blog-specific related-blog filtering

Keep the documented structural and styling patterns unchanged.

### 16. FINAL SELF-CHECK BEFORE OUTPUT

Before returning the generated code, verify:

* [ ] Existing design reproduced accurately
* [ ] Existing colors and typography followed
* [ ] Existing layout and spacing followed
* [ ] Existing responsive behavior followed
* [ ] New CSS/components/files, if created, match the existing design
* [ ] No unnecessary redesign or visual changes
* [ ] No hardcoded user-facing text
* [ ] No `defaultValue` in `t()`
* [ ] Correct HTML/component structure
* [ ] Correct MUI `sx` usage
* [ ] Correct typography classes
* [ ] Correct hero grid
* [ ] Correct hero image behavior
* [ ] Correct 320px padding rule
* [ ] Correct responsive breakpoints
* [ ] Required shared components included
* [ ] Correct button implementation
* [ ] Related Blogs included
* [ ] No image distortion
* [ ] No horizontal overflow
* [ ] Existing Header/Footer reused
* [ ] Existing components/styles reused where applicable
* [ ] Final page visually matches the existing blog pages
* [ ] Existing project patterns followed


### 17. MOST IMPORTANT RULE

> **DO NOT GENERATE WHAT YOU THINK THE DESIGN SHOULD LOOK LIKE.**
>
> **GENERATE WHAT THIS DESIGN SYSTEM AND THE EXISTING PROJECT ACTUALLY DEFINE.**



### 18. CSS GENERATION SCOPE � BODY CONTENT ONLY

When generating CSS for a new blog page, you must **ONLY generate styles for the body/main content area**.

**DO NOT generate CSS or styles for:**

* **Header** � the existing reusable Header component handles this.
* **Footer** � the existing reusable Footer component handles this.
* **Comment Form** � the existing reusable BlogCommentForm component handles this.

These three components (Header, Footer, BlogCommentForm) are **shared, reusable components** that already have their own styles. They are imported and used as-is. You must not create, duplicate, override, or generate any CSS/sx styles targeting them.

**Your CSS output must be scoped exclusively to:**

* The page wrapper (<div className="blog-details-page">)
* The hero section (MUI Box with sx props)
* The main content area (<main className="blog-main-article">)
* Content sections (<section className="technical-section">)
* Related Blogs section
* BlogSocialAuthor layout (if positional adjustments are needed via sx)
* BlogBackButton positioning (already handled via sx)

**In summary:** Generate the **body** � everything between the Header and Footer. The Header, Footer, and Comment Form are plug-and-play; just import and render them, do not style them.






## ⚠️ CRITICAL RULES — READ FIRST
main rule u can create css but must follow the md file css code and classes.

**These rules are non-negotiable. Violating any of them means the output is WRONG.**

### Rule 1: NEW CSS CLASSES

You may ONLY create CSS classes that already exist in md file . If a class name is not listed in this document, **do not create it**., please follow md file css code 

**Forbidden examples** (these do NOT exist):
- `detail-two-column`, `section-dark`, `flow-diagram`, `flow-step`, `flow-arrow`
- `pricing-display`, `pricing-body`, `pricing-readout`, `stats-grid`, `stat-key`
- `versus-grid`, `versus-card`, `blog-chip-list`, `pull-quote`, `blog-detail-rail`
- Any class prefixed with a new page name

If you need a new visual pattern (e.g., a pricing table, comparison card, stats grid), implement it using **inline MUI `sx` props only** � do NOT create new CSS classes in a separate file.

**CSS scope restriction:** Any CSS or `sx` styles you generate must target **body content only** (hero, main article, content sections, related blogs). Do NOT generate or create any CSS/`sx` styles for the **Header**, **Footer**, or **`BlogCommentForm`** � these are shared reusable components with their own encapsulated styles. Just import and render them as-is.

### Rule 2: USE EXACT HTML ELEMENTS, NOT MUI REPLACEMENTS

The existing blog pages (Blog7+) use **plain HTML** for these elements. Do NOT replace them with MUI `Box`:

| Element | Use THIS | NOT this |
|---|---|---|
| Page wrapper | `<div className="blog-details-page">` | `<Box component="main">` |
| Main content | `<main className="blog-main-article">` | `<Box className="blog-main-article">` |
| Content sections | `<section className="technical-section">` | `<Box component="section" className="technical-section">` |
| Section dividers | `<hr className="target-divider" />` | any other divider |
| Lists | `<ul className="blog-check-list">` | `<Box component="ul">` |

**Use MUI `Box`/`Typography` WITH `sx` ONLY for:** the hero section, hero content, hero image, author info, and any element that needs responsive `sx` breakpoint styling.

### Rule 3: ALL TEXT MUST USE `t()` — ZERO HARDCODED TEXT

Every single user-facing string must use `t("translationKey")`. No exceptions. No `defaultValue` fallbacks in the JSX.

```jsx
// ✅ CORRECT
{t("blog10Page.intro.paragraph1")}

// ❌ WRONG — hardcoded text
"Der digitale Marktplatz vermittelt..."

// ❌ WRONG — defaultValue fallback
{t("blog10Page.intro.paragraph1", { defaultValue: "Der digitale..." })}
```

Create a separate i18n translation JSON file with all the text content.

### Rule 4: DO NOT CREATE WRAPPER/HELPER COMPONENTS

Do NOT create inline helper components like `<Text>`, `<Heading>`, `<Label>`, `<Figure>`. Use `<Typography>` and `<Box>` directly every time, matching the existing pattern:

```jsx
// ✅ CORRECT — use Typography directly
<Typography component="h2" className="section-heading headings-h3">
  {t("blog10Page.section1.title")}
</Typography>

// ❌ WRONG — custom wrapper
const Heading = ({ children }) => (
  <Typography component="h2" className="section-heading headings-h3">{children}</Typography>
);
```

### Rule 5: EVERY BLOG DETAIL PAGE MUST INCLUDE

1. `<BlogBackButton />` — inside the hero section
2. `<BlogSocialAuthor />` — after all content sections, before comment form
3. `<BlogCommentForm />` — after social/author section
4. **Related Blogs Section** — after the comment form (see template below)

Missing ANY of these means the page is incomplete.

### Rule 6: MATCH THE EXACT HERO GRID SYNTAX

```jsx
gridTemplateColumns: {
  xs: "1fr",
  sm: "1fr",
  md: "1fr",
  lg: "minmax(0, 1fr) minmax(0, 1fr)",  // NOT "1fr 1fr"
},
```

Use `minmax(0, 1fr)` — NOT `1fr`. This prevents content overflow.

### Rule 7: ADD 320px BREAKPOINT PADDING TO ALL TEXT ELEMENTS

Every `<Typography>` and `<Box>` with text content inside `<main>` needs:

```jsx
sx={{
  "@media (max-width: 320px)": {
    px: 2,
  },
}}
```

### Rule 8: PAGE-SPECIFIC CSS FILE RULES

If you need a page-specific CSS file, it may ONLY contain:
- Styles for **genuinely new visual elements** not covered by `BlogDetails.css` (like a custom table or comparison card)
- All new styles must be **scoped under a page-specific class** (e.g., `.blog10-page .custom-element`)
- Do NOT redefine `.section-heading`, `.section-description`, `.target-divider`, or any existing class
- Keep the CSS file as SMALL as possible — prefer `sx` props for custom elements

---

### Rule 9: CSS SCOPE � BODY CONTENT ONLY (NO HEADER, FOOTER, OR FORM STYLES)

When generating CSS for a blog page, generate styles **ONLY** for the main body content. The Header, Footer, and BlogCommentForm are reusable components with their own encapsulated styles.

- **DO NOT** generate any CSS or `sx` overrides for the Header component
- **DO NOT** generate any CSS or `sx` overrides for the Footer component
- **DO NOT** generate any CSS or `sx` overrides for the `BlogCommentForm` component
- **DO** generate CSS/`sx` only for: hero section, main article content, content sections, related blogs section

These shared components are imported and rendered as-is. Just include them in the JSX � no styling needed.


## Source of Truth

All design rules were extracted from these files:

| File | Role |
|---|---|
| **`App.css`** | **Global styles — `@font-face` declarations, heading classes (`headings-h1`–`h5`), body text classes (`bodyRegularText1`–`5`), all responsive typography breakpoints. Uses `!important` on all values.** |
| `Blog.css` | Blog listing page styles (CSS classes + responsive media queries) |
| `BlogDetails.css` | Blog detail page styles, CSS custom properties (`:root`), all component classes, all responsive breakpoints |
| `BlogDetails.js` | Blog detail page #1 — MUI `sx` overrides, `designTokens` object, hero/content/author structure |
| `Blog7page.js` | Blog detail page #7 — representative newer blog page, CSS class + MUI `sx` hybrid |
| `Blog8page.js` | Blog detail page #8 — same pattern as Blog7 |
| `Blog9page.js` | Blog detail page #9 — longest blog, demonstrates all section types |
| `Blogs.js` | Blog listing page component |
| `BlogCard.js` | Reusable blog card for the listing grid |
| `BlogData.js` | Blog data array (id, slug, category, date, title, author, image) |
| `BlogSocialAuthor.js` | Reusable social sharing + author card component (MUI `sx`) |
| `BlogBackButton.js` | Reusable back-to-listing button (MUI `sx`, responsive) |
| `BlogCommentForm.jsx` | Reusable comment form component |

> **CRITICAL — Specificity Chain for Typography:**
>
> `App.css` global typography classes use `!important` on **all** font-size, font-family, font-weight, and line-height values.
>
> This means the **actual rendered font sizes** come from `App.css`, NOT from:
> - CSS variables like `var(--font-size-xl)` in `BlogDetails.css`
> - MUI `sx={{ fontSize: ... }}` in JSX
>
> **Specificity winner for typography:** `App.css` (`!important`) > MUI `sx` (inline) > `BlogDetails.css` (class selectors)
>
> **Specificity winner for layout/spacing:** MUI `sx` (inline) > CSS classes. `App.css` does NOT use `!important` on layout properties.
>
> **In practice:** When an element has `className="section-description bodyRegularText3"`, the font-size comes from `bodyRegularText3` in `App.css` (`!important`), but spacing/margin comes from `.section-description` in `BlogDetails.css` (unless overridden by `sx`).

---

## Technology

| Aspect | Value |
|---|---|
| Framework | React.js |
| UI Library | MUI (Material UI) — `Box`, `Typography`, `Snackbar`, `Alert` |
| Styling | Hybrid — CSS files (`.css`) + MUI `sx` prop + CSS custom properties (`:root`) |
| Routing | `react-router-dom` (`Link`, `useParams`, `useNavigate`) |
| i18n | `react-i18next` (`useTranslation`, `t()`) |
| Typography classes | Global classes from parent project: `headings-h2`, `headings-h3`, `headings-h4`, `headings-h5`, `bodyRegularText3`, `bodyRegularText4` |
| Email | `@emailjs/browser` (comment form only) |

**Do NOT introduce** Tailwind, Bootstrap, styled-components, or any other CSS framework.

---

## Font-Face Declarations (from App.css)

These custom fonts must be available. They are loaded via `@font-face` in `App.css`:

```css
@font-face {
  font-family: SatoshiRegular;
  src: url(../public/Satoshi-Regular.otf);
}

@font-face {
  font-family: SatoshiMedium;
  src: url(../public/Satoshi-Medium.otf);
}

@font-face {
  font-family: PowerGroteskTrialBold;
  src: url(../public/powergrotesk-bold.otf);
}

@font-face {
  font-family: ShantellSans;
  src: url(../public/ShantellSans-Regular.ttf);
}
```

> **Note:** The CSS variable in BlogDetails.css references `PowerGroteskTrialBoldf` (with trailing `f`), but App.css declares `PowerGroteskTrialBold` (without `f`). The App.css `!important` declaration on heading classes forces `PowerGroteskTrialBold` — this is the correct font name.

### Global Body Defaults (from App.css)

```css
* {
  font-family: SatoshiRegular;
}

body {
  background: #1D1D1F;
  color: #FCFCFC;
}
```

All elements default to `SatoshiRegular`. Body background is `#1D1D1F` (slightly different from blog page `#1f1f1f` — the blog page overrides this).

---

## Global Typography Classes (from App.css) — ALL USE `!important`

These classes are the **authoritative source for all font sizes** across the project. Because they use `!important`, they override any CSS variable-based font-sizes in `BlogDetails.css` AND any MUI `sx` font-size values.

### Heading Classes

**Base properties (shared by all heading classes):**

```css
.headings-h1, .headings-h2, .headings-h3, .headings-h4, .headings-h5 {
  font-family: PowerGroteskTrialBold !important;
  font-style: normal !important;
  font-weight: 600 !important;
  line-height: 120% !important;
  letter-spacing: -0.84px !important;
}
```

**Exception:** `.headings-h5` overrides `letter-spacing` to `1.5px !important`.

#### Heading Font Sizes — Complete Responsive Table

| Class | Default | ≥2100px | ≤1640px | ≤1440px | ≤1024px | ≤768px | ≤480px |
|---|---|---|---|---|---|---|---|
| `.headings-h1` | **84px** | 100px | 62px | 50px | 50px | 48px | 36px |
| `.headings-h2` | **67px** | 87px | 58px | — | 50px | 40px | 30px |
| `.headings-h3` | **54px** | 74px | 46px | — | 40px | 32px | 26px |
| `.headings-h4` | **43px** | 55px | 36px | — | 30px | 24px | 20px |
| `.headings-h5` | **23px** | — | — | — | — | — | — |

> **All values use `!important`.** These are the FINAL rendered font sizes regardless of what `BlogDetails.css` or MUI `sx` specifies.

### Body Text Classes

**Base properties (shared by all bodyRegularText classes):**

```css
.bodyRegularText1, .bodyRegularText2, .bodyRegularText3,
.bodyRegularText4, .bodyRegularText5 {
  font-family: SatoshiRegular !important;
  font-style: normal !important;
  font-weight: 400 !important;
  line-height: 150% !important;
}
```

**Base properties (shared by all bodyMediumText classes):**

```css
.bodyMediumText1, .bodyMediumText2, .bodyMediumText3, .bodyMediumText4 {
  color: #1A1A1A;
  font-family: SatoshiMedium !important;
  font-style: normal !important;
  font-weight: 500 !important;
  line-height: 150% !important;
}
```

> **Note:** `bodyMediumText` classes set `color: #1A1A1A` (dark). Blog pages override this color via `sx` or CSS classes since the blog uses a dark theme.

#### Body Text Font Sizes — Complete Responsive Table

| Class | Default | ≥2100px | ≤1640px | ≤1024px | ≤768px | ≤480px | ≤375px |
|---|---|---|---|---|---|---|---|
| `.bodyRegularText1` | **14px** | 18px | 13px | 12px | 10px | 9px | — |
| `.bodyRegularText2` / `.bodyMediumText1` | **28px** | 30px | 24px | 20px | 18px | 16px | 12px |
| `.bodyRegularText3` / `.bodyMediumText2` | **22px** | 24px | 20px | 18px | 16px | 14px | — |
| `.bodyRegularText4` / `.bodyMediumText3` | **17px** | 20px | 15px | 14px | 13px | 12px | 10px |
| `.bodyRegularText5` / `.bodyMediumText4` | **12px** | 16px | 11px | 10px | 9px | 8px | — |

> **All values use `!important`.** These are the FINAL rendered font sizes.

#### `.bodyRegularText1` Special Line-Height

`.bodyRegularText1` overrides `line-height` to `100% !important` (instead of the shared `150%`).

### How Typography Classes Are Used in Blog Pages

| Element | Heading Class | Body Class | Semantic HTML |
|---|---|---|---|
| Blog listing H1 | `headings-h2` | — | `<h1>` |
| Blog listing intro paragraph | — | `bodyRegularText3` | `<p>` |
| Blog card title | `headings-h5` | — | `<h2>` |
| Blog card description | — | `bodyRegularText4` | `<p>` |
| Hero title (BlogDetails.js) | `headings-h2` | — | `<h1>` |
| Hero title (Blog7+) | `headings-h3` | — | `<h1>` |
| Hero category/meta | — | `bodyRegularText4` | `<span>` |
| Section heading | `headings-h3` | — | `<h2>` |
| Section subtitle | `headings-h4` | — | `<h4>` |
| Section description | — | `bodyRegularText3` | `<p>` |
| Section label | — | `bodyRegularText3` or `bodyRegularText4` | `<span>` |
| Intro paragraph | — | `bodyRegularText3` | `<p>` |
| Author name | — | `bodyRegularText4` | `<span>` |
| Social link text | — | `bodyRegularText4` | `<a>` |
| Social label | `headings-h5` | — | `<span>` |
| Related blog category | — | `bodyRegularText3` | `<div>` |
| Related blog title | — | `bodyRegularText3` | `<h3>` |
| List items | — | `bodyRegularText3` | `<li>` / `<span>` |

---

## Existing Shared Components

### Header

Header is an **existing shared component** from the parent project. **Do not recreate, redesign, resize, or replace it.**

The blog detail page accounts for the header by applying a `margin-top`:
- CSS (`.blog-details-page`): `margin-top: 120px`
- MUI `sx` override (BlogDetails.js): `marginTop: { xs: "90px", sm: "90px", md: "90px", lg: "120px" }`
- On all blog detail pages, the hero section has a consistent `margin-top: 90px` across all breakpoints ≤1024px.

The blog listing page uses `padding-top` inside `.blogs-page` to create header clearance.

### Footer

Footer is an **existing shared component** from the parent project. **Do not recreate, redesign, resize, or replace it.** Blog pages do not apply any special footer styling.

---

## CSS Custom Properties (Design Tokens from `:root`)

These are defined in `BlogDetails.css` `:root` and used throughout all blog detail pages.

### Colors

| Variable | Value | Usage |
|---|---|---|
| `--color-bg-dark` | `#1f1f1f` | Main page background |
| `--color-bg-light` | `#161616` | Author card background, secondary background |
| `--color-bg-white` | `#161616` | Table/card backgrounds (dark theme — NOT actually white) |
| `--color-bg-light-gray` | `#161616` | Table label background |
| `--color-bg-input` | `#f9f9f9` | Form input background |
| `--color-bg-box` | `#2d5e38` | Feature highlight box background |
| `--color-text-primary` | `#c2c2c4` | Default body text color |
| `--color-text-light` | `#999` | Meta text, secondary text |
| `--color-text-dark` | `#1f1f1f` | Dark text (used on light backgrounds like buttons) |
| `--color-text-gray` | `#777` | Problem description text |
| `--color-text-white` | `#ffffff` | Headings, white text |
| `--color-accent-green` | `#6aaa4b` | Problem highlight border, CTA accent |
| `--color-accent-green-dark` | `#71965a` | Section labels, check-list markers, notes |
| `--color-accent-green-light` | `#5fb878` | Advantage highlight border, green table header |
| `--color-accent-blue` | `#2c7dbf` | Blue table header |
| `--color-accent-orange` | `#fa7854` | Detail card headings |
| `--color-accent-red` | `#e74c3c` | Required form field indicator |
| `--color-accent-success` | `#6ee45a` | Newsletter button, CTA hover |
| `--color-border-light` | `#e4e7e2` | Section dividers |
| `--color-border-mid` | `#d0d0d0` | Specs table border |
| `--color-border-dark` | `#dedfdd` | Revenue table, location card borders |
| `--color-border-form` | `#aeb5aa` | Form input focus border |

#### Additional Colors (from JS / inline)

| Color | Usage |
|---|---|
| `#111111` | CTA card background |
| `#1d1d1f` | Comment form background |
| `#525252` | Comment form border |
| `#fcfcfc` | Comment title text |
| `#7fee64` | "Read more" link on blog cards (listing page) |
| `#2a2a2a` | Snackbar background |
| `#21CD83` | Success snackbar text |
| `#ff4d4d` | Error snackbar text |

### Spacing Tokens

| Variable | Value |
|---|---|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `12px` |
| `--space-lg` | `16px` |
| `--space-xl` | `20px` |
| `--space-2xl` | `24px` |
| `--space-3xl` | `28px` |
| `--space-4xl` | `32px` |
| `--space-5xl` | `40px` |
| `--space-6xl` | `60px` |
| `--space-7xl` | `80px` |
| `--space-8xl` | `100px` |
| `--space-9xl` | `120px` |
| `--space-10xl` | `140px` |
| `--space-11xl` | `160px` |

### Typography Tokens

| Variable | Value | Usage |
|---|---|---|
| `--font-family-heading` | `PowerGroteskTrialBoldf` | All headings (H1, H2, H3) |
| `--font-family-body` | `SatoshiRegular` | Body text, paragraphs |
| `--font-family-body-medium` | `SatoshiMedium` | CTA links, medium-weight body text |

### Line Height Tokens

| Variable | Value |
|---|---|
| `--line-height-tight` | `1` |
| `--line-height-snug` | `1.08` |
| `--line-height-normal` | `1.15` |
| `--line-height-relaxed` | `1.18` |
| `--line-height-loose` | `1.2` |
| `--line-height-looser` | `1.25` |
| `--line-height-very-loose` | `1.35` |
| `--line-height-extra-loose` | `1.4` |
| `--line-height-ultra-loose` | `1.45` |
| `--line-height-massive` | `1.5` |
| `--line-height-spacious` | `1.6` |
| `--line-height-generous` | `1.7` |
| `--line-height-extended` | `1.8` |

### Letter Spacing Tokens

| Variable | Value |
|---|---|
| `--letter-spacing-tight` | `-1px` |
| `--letter-spacing-normal` | `0` |
| `--letter-spacing-wide` | `0.25px` |
| `--letter-spacing-wider` | `0.5px` |
| `--letter-spacing-widest` | `1px` |
| `--letter-spacing-ultra-wide` | `1.5px` |

### Border Radius Tokens

| Variable | Value | Usage |
|---|---|---|
| `--radius-none` | `0` | Highlight boxes |
| `--radius-sm` | `3px` | Location cards, weekend note |
| `--radius-md` | `4px` | Revenue table |
| `--radius-lg` | `12px` | Blog card images, hero image, comment form |
| `--radius-full` | `50%` | Author avatar |

### Container Width Tokens

| Variable | Value | Usage |
|---|---|---|
| `--container-max` | `1200px` | Blog listing grid + intro (CSS) |
| `--container-article` | `1024px` | Blog detail sections (CSS) |
| `--section-max` | `1024px` | Alias for article container |

> **IMPORTANT — CSS vs JS conflict on content max-width:**  
> CSS defines `--container-article: 1024px` and the CSS class `.blog-main-article` uses `max-width: var(--container-article)` → **1024px**.  
> JS `designTokens.containerMax` is set to **`"1040px"`** and MUI `sx` applies `maxWidth: designTokens.containerMax` → **1040px**.  
> **MUI `sx` wins** because inline style has higher specificity. The actual rendered max-width for the main blog content container is **1040px**.  
> For the hero section, there is **NO** `1040px` or `1024px` restriction — it uses full available width.

### Padding Tokens

| Variable | Value | Usage |
|---|---|---|
| `--padding-mobile` | `20px` | Mobile horizontal padding (default) |
| `--padding-mobile-sm` | `16px` | Small mobile horizontal padding |
| `--padding-tablet` | `30px` | Tablet horizontal padding |
| `--padding-tablet-lg` | `40px` | Large tablet horizontal padding |
| `--padding-desktop` | `40px` | Desktop horizontal padding |

> **Note:** At `≤320px`, `--padding-mobile` is overridden to `12px`.

---

## Blog Listing Page

### Container

```
CSS class: .blogs-page
```

| Property | Value |
|---|---|
| `width` | `100%` |
| `min-height` | `100vh` |
| `background` | `#1f1f1f` |
| `color` | `#c2c2c4` |
| `box-sizing` | `border-box` |

#### Responsive Padding

| Breakpoint | `padding` |
|---|---|
| Default (desktop) | `120px 120px 0` |
| `≤900px` (tablet) | `70px 70px 0` |
| `≤640px` (mobile) | `30px` |
| `≤600px` (very small mobile) | `16px` + `margin-top: 80px` |
| `≤360px` (extra small) | `12px 12px 0` |
| `≥1920px` (ultra-wide) | `160px 160px 0` |

### Intro Section

```
CSS class: .blogs-intro
```

| Property | Default | `≤900px` | `≤640px` | `≤600px` | `≤360px` |
|---|---|---|---|---|---|
| `max-width` | `1200px` | — | — | — | — |
| `margin` | `0 auto` | — | — | — | — |
| `padding` | `80px 40px 100px` | `70px 30px 80px` | `55px 20px 60px` | `45px 16px 50px` | `36px 12px 40px` |

#### Intro H1

| Property | Default | `≤900px` | `≤640px` | `≤600px` |
|---|---|---|---|---|
| `font-size` | `64px` | `52px` | `38px` | `32px` |
| `line-height` | `1.05` | — | — | — |
| `font-weight` | `700` | — | — | — |
| `letter-spacing` | `-2px` | — | `-1px` | — |
| `color` | `#fff` | — | — | — |
| `margin-bottom` | `35px` | — | `25px` | — |

Uses global class: `headings-h2`

#### Intro Paragraph

| Property | Default | `≤640px` |
|---|---|---|
| `font-size` | `17px` | `15px` |
| `line-height` | `1.6` | `1.6` |
| `font-weight` | `500` | — |
| `color` | `#c2c2c4` | — |
| `max-width` | `1100px` | — |

Uses global class: `bodyRegularText3`

### Grid

```
CSS class: .blogs-grid
```

| Property | Default | `≤900px` | `≤640px` | `≤600px` | `≤360px` |
|---|---|---|---|---|---|
| `max-width` | `1200px` | — | — | — | — |
| `margin` | `0 auto` | — | — | — | — |
| `display` | `grid` | — | — | — | — |
| `grid-template-columns` | `repeat(2, minmax(0, 1fr))` | — | `1fr` | — | — |
| `column-gap` | `60px` | `35px` | — | — | — |
| `row-gap` | `70px` | — | — | — | — |
| `gap` (shorthand, mobile) | — | — | `55px` | — | — |
| `padding` | `0 40px 0` | `0 30px 0` | `0 20px 0` | `0 16px 0` | `0 12px 0` |

**Key:** Grid collapses from **2 columns → 1 column** at `≤640px`.

### Blog Cards

```
CSS class: .blog-card
```

| Property | Value |
|---|---|
| `width` | `100%` |
| `min-width` | `0` |
| `background` | `transparent` |
| `color` | `#c2c2c4` |

Each card is an `<article>` element with `data-cursor="hover"` and an `onClick` handler that navigates to the blog detail page.

#### Card Structure

```
<article class="blog-card">
  <div class="blog-card-image-wrapper">
    <img class="blog-card-image" />
  </div>
  <div class="blog-card-content">
    <span class="blog-card-date">{date}</span>
    <h2 class="headings-h5">{title}</h2>
    <p class="bodyRegularText4">{description}</p>
    <span class="blog-read-more">Read More</span>
  </div>
</article>
```

> **Note on card image classes:** `BlogCard.js` uses `blog-card-image-wrapper` and `blog-card-image` on the `<img>` directly, while `Blog.css` defines `.blog-card-image` as a container div. The CSS `.blog-card-image` rules (max-width, height, overflow, border-radius) apply to the image wrapper container. The `img` inside uses `width: 100%`, `height: 100%`, `object-fit: cover`.

#### Card Image

| Property | Default | `≤900px` | `≤640px` | `≤600px` |
|---|---|---|---|---|
| `max-width` | `450px` | — | — | — |
| `height` | `300px` | `360px` | `350px` | `300px` |
| `overflow` | `hidden` | — | — | — |
| `border-radius` | `12px` | — | — | — |
| `margin-bottom` | `25px` | — | — | — |

Card image hover effect: `transform: scale(1.02)` with `transition: transform 0.3s ease`

#### Card Category

| Property | Value |
|---|---|
| `font-size` | `12px` |
| `line-height` | `1.2` |
| `font-weight` | `600` |
| `letter-spacing` | `0.8px` |
| `text-transform` | `uppercase` |
| `color` | `#c2c2c4` |
| `margin-bottom` | `12px` |

#### Card Title

| Property | Default | `≤900px` | `≤640px` | `≤600px` |
|---|---|---|---|---|
| `font-size` | `30px` | `26px` | `25px` | `22px` |
| `line-height` | `1.15` | — | — | — |
| `font-weight` | `700` | — | — | — |
| `letter-spacing` | `-0.8px` | — | — | — |
| `color` | `#c2c2c4` | — | — | — |
| `max-width` | `500px` | — | — | — |

Uses global class: `headings-h5`

#### Card Description

| Property | Value |
|---|---|
| `font-size` | `15px` |
| `line-height` | `1.6` |
| `color` | `#c2c2c4` |
| `margin-top` | `18px` |

#### Read More Link

| Property | Value |
|---|---|
| `color` | `#7fee64` |
| `margin-top` | `0` (overrides the default `20px` from `.blog-card-link`) |

---

## Blog Detail Page

### Page Container

The outermost wrapper uses:
- CSS class: `blog-details-page` (used in Blog7page, Blog8page, etc.)
- OR MUI `Box` with `component="main"` and `sx` (used in BlogDetails.js)

| Property | CSS value | MUI sx value (takes precedence when used) |
|---|---|---|
| `width` | `100%` | `100%` |
| `background` | `#1f1f1f` | `#1f1f1f` |
| `color` | `#c2c2c4` | `#c2c2c4` |
| `padding` | `0` | `0` |
| `margin-top` | `120px` | `{ xs: "90px", sm: "90px", md: "90px", lg: "120px" }` |

### Hero Section

The hero section has **NO max-width restriction** — it uses the full available viewport width.

**Structure:** 2-column grid (text left, image right) on desktop → 1-column stack on tablet/mobile.

#### Hero Container (MUI `sx` — authoritative)

| Property | xs | sm | md | lg | xl |
|---|---|---|---|---|---|
| `padding` | `100px 16px 60px` | `110px 24px 80px` | `120px 32px 90px` | `140px 5vw 100px` | `150px 6vw 110px` |
| `gridTemplateColumns` | `1fr` | `1fr` | `1fr` | `1fr 1fr` | `1fr 1fr` |
| `gap` | `45px` | `55px` | `60px` | `5vw` | `6vw` |
| `alignItems` | `center` | `center` | `center` | `center` | `center` |

> Some blog pages (Blog7, Blog8) use slightly different hero padding:  
> `xs: "50px 16px 60px"`, `sm: "70px 24px 80px"`, `md: "80px 32px 90px"`, `lg: "100px 5vw 100px"`, `xl: "110px 6vw 110px"`  
> Both patterns are acceptable. The key constraint is: **NO max-width restriction on the hero.**

The hero has `position: "relative"` to support the absolutely-positioned BlogBackButton.

#### Hero Content (Left Column)

- `display: flex`, `flex-direction: column`, `justify-content: center`
- `paddingLeft`: `{ xs: 0, lg: "2vw", xl: "1vw" }`

##### Category / Meta Text

| Property | xs | sm | md | lg |
|---|---|---|---|---|
| `fontSize` | `11px` | `12px` | `13px` | `14px` |
| `fontWeight` | `600` | — | — | — |
| `letterSpacing` | `0.4px` | — | — | — |
| `textTransform` | `uppercase` | — | — | — |
| `color` | `#999` | — | — | — |
| `marginBottom` | `14px` | `16px` | `18px` | `20px` |

Uses global class: `bodyRegularText4`

##### Hero Title

| Property | xs | sm | md | lg |
|---|---|---|---|---|
| `fontSize` | `34px` | `44px` | `54px` | `clamp(52px, 4.2vw, 88px)` |
| `fontWeight` | `700` | — | — | — |
| `lineHeight` | `1.12` | `1.1` | `1.08` | `1.08` |
| `letterSpacing` | `-0.8px` | `-1px` | `-1.3px` | `-2px` |
| `color` | `#ffffff` | — | — | — |
| `fontFamily` | `PowerGroteskTrialBoldf` | — | — | — |

Uses global class: `headings-h2` or `headings-h3` (varies by blog page). Newer pages (Blog7+) use `headings-h3`.

##### Hero Author Info

| Property | xs | sm | md | lg | xl |
|---|---|---|---|---|---|
| Author image width/height | `48px` | `56px` | `64px` | `72px` | `80px` |
| Gap | `10px` | `12px` | `14px` | — | — |
| `marginTop` | `28px` | `32px` | `36px` | `40px` | — |
| Author name fontSize | `12px` | `13px` | `14px` | `15px` | — |
| Author name fontWeight | `600` | — | — | — | — |
| Author name color | `#c2c2c4` | — | — | — | — |
| Company name fontSize | `11px` | `12px` | `12px` | `13px` | — |
| Company name lineHeight | `1.4` | — | — | — | — |
| Company name color | `#999` | — | — | — | — |

Author image: `border-radius: 50%`, `object-fit: cover`, `flex-shrink: 0`

#### Hero Image (Right Column)

> **CRITICAL: Hero image is HIDDEN on `xs` breakpoint.**

| Property | xs | sm | md | lg | xl | 1920px+ | 2560px+ |
|---|---|---|---|---|---|---|---|
| `display` | **`none`** | `flex` | `flex` | `flex` | — | — | — |
| `width` | — | `75%` | `65%` | `70%` | `75%` | `80%` | `85%` |
| `height` | — | `300px` | `450px` | `500px` | `550px` | `480px` | `600px` |
| `maxHeight` | — | `300px` | `450px` | `500px` | `550px` | `480px` | `600px` |

- `objectFit: "cover"`, `objectPosition: "center"`, `margin: "0 auto"`, `maxWidth: "none"`
- MUI `xs` breakpoint = **0px** (default MUI theme). Hero image hidden at `display: "none"` on `xs`, visible from `sm` (600px) upward.

### Main Content Container

After the hero, the main blog article content area is constrained.

| Property | Source | Value |
|---|---|---|
| `maxWidth` | MUI `sx` (authoritative) | **`1040px`** |
| `maxWidth` | CSS `.blog-main-article` (base) | `var(--container-article)` = `1024px` |
| `margin` | Both | `0 auto` |

**Use `1040px` as the max-width** (MUI `sx` overrides CSS).

#### Main Content Responsive Padding

| Breakpoint | Padding (MUI `sx`) |
|---|---|
| `xs` | `0 12px 30px` |
| `sm` | `0 24px 40px` |
| `md` | `0 30px 60px` |
| `lg` | `0 0 80px` |

CSS fallback values (lower priority):
| Breakpoint | Padding |
|---|---|
| Default | `0 0 80px` |
| `≤1024px` | `0 30px 60px` |
| `≤768px` | `0 24px 50px` |
| `≤640px` | `0 20px 40px` |
| `≤480px` | `0 16px 30px` |
| `≤375px` | `0 12px 20px` |
| `≤320px` | `0 8px 15px` |

### Content Sections

Each major content section inside `.blog-main-article` uses one of these CSS classes:

| Class | `max-width` | `margin` | Usage |
|---|---|---|---|
| `.intro-section` | `var(--container-article)` | `0 auto 60px` | Opening paragraphs |
| `.technical-section` | `var(--container-article)` | `80px auto` | Main content sections |
| `.photo-section` | `var(--container-article)` | `40px auto 0` | Photo galleries |
| `.target-section` | `var(--container-article)` | auto left/right, `40px` top | Target/detail sections |

> On `≤1024px`, all section classes get `width: 100%`, `max-width: 100%`.

#### Section Dividers

```
CSS class: .target-divider
```

| Property | Value |
|---|---|
| `width` | `100%` |
| `max-width` | `var(--container-article)` |
| `margin` | `0 auto 20px` |
| `border` | `none` |
| `border-top` | `1px solid #e4e7e2` |

Used as `<hr className="target-divider" />` between major blog sections.

### Section Spacing Summary

| Element | Spacing Rule |
|---|---|
| Intro section margin-bottom | `60px` |
| Technical section vertical margin | `80px auto` |
| Section description margin-bottom | `30px` (CSS default), `20px` at `≤640px` |
| Section divider margin-bottom | `20px` |
| Photo section margin-top | `40px` |
| Paragraph margin-bottom | `24px` (intro), `30px` (section description) |
| Problem highlight vertical margin | `40px 0` (desktop) → `15px 0` (xs) |
| Lists margin | `20px 0` |
| Photo grid margin-bottom | `20px` |

### Author Section (BlogSocialAuthor Component)

**This is a reusable component.** File: `BlogSocialAuthor.js`

Props:
- `socialTranslationKey` (default: `"blog3Page.social"`)
- `authorTranslationKey` (default: `"blog3Page.author"`)

#### Social Spread Row

| Property | xs | sm | md | lg |
|---|---|---|---|---|
| Container `maxWidth` | `1040px` | — | — | — |
| Container `marginTop` | `40px` | `50px` | `60px` | `80px` |
| Layout | `display: flex`, `justify-content: space-between`, `align-items: center` | — | — | — |
| Social icons gap | `14px` | `18px` | `20px` | `24px` |
| `marginBottom` | `30px` | `35px` | `40px` | `50px` |

Social label uses global class `headings-h5`, color `#ffffff`.

Social links are text-based (`f` for Facebook, `in` for LinkedIn), using class `bodyRegularText4`, color `#ffffff`, `textDecoration: none`, hover: `opacity: 0.7`.

#### Author Card

| Property | xs | sm | md | lg |
|---|---|---|---|---|
| Layout | `display: flex`, `align-items: center` | — | — | — |
| Gap | `14px` | `18px` | `20px` | `24px` |
| Padding | `20px 0` | `24px 0` | `28px 0` | `32px 0` |
| Author image size | `55px` | `65px` | `75px` | `85px` |
| Author name fontSize | `13px` | `14px` | `15px` | `16px` |
| Author name fontWeight | `600` | — | — | — |
| Author name color | `#ffffff` | — | — | — |
| Author description fontSize | `12px` | `13px` | `14px` | `16px` |
| Author description lineHeight | `1.5` | — | — | — |
| Author description fontWeight | `400` | — | — | — |
| Author description color | `#999999` | — | — | — |
| Author description marginTop | `5px` | — | — | — |

Author image: `borderRadius: "50%"`, `objectFit: "cover"`, `flexShrink: 0`.

### Blog Back Button (BlogBackButton Component)

**This is a reusable component.** File: `BlogBackButton.js`

- `position: absolute` inside the hero section
- `z-index: 10`
- Circular transparent button with `ArrowBackIcon` from MUI
- Hover: `backgroundColor: rgba(255,255,255,0.08)`, `transform: translateX(-3px)`
- Focus-visible: `outline: 2px solid rgba(255,255,255,0.5)`, `outlineOffset: 3px`

| Property | xs | sm | md | lg | xl |
|---|---|---|---|---|---|
| `top` | `30px` | `35px` | `40px` | `45px` | `50px` |
| `left` | `16px` | `24px` | `32px` | `5vw` | `6vw` |
| Button size | `36px` | `40px` | `44px` | `48px` | — |
| Icon fontSize | `22px` | `24px` | `26px` | `28px` | — |

### Comment Form (BlogCommentForm Component)

**This is a reusable component.** File: `BlogCommentForm.jsx`

- Uses CSS class `comment-section` (max-width: `var(--container-article)`, margin: `80px auto`)
- Form background: `#1d1d1f`, border: `1px solid #525252`, border-radius: `12px`
- Uses `CustomTextField` from the parent project and `AnimateButton`
- Fields: First Name (required), Last Name, Email (required), Website, Comment (required, min 10 chars)

### Related Blogs Section

```
CSS class: .blog-related-section
```

**Full-width breakout:**
```css
width: 100vw;
max-width: none;
margin-left: calc(50% - 50vw);
margin-right: calc(50% - 50vw);
```

#### Related Blogs Grid

| Property | Default | `≤1024px` | `≤768px` | `≤640px` | `≤480px` | `≤320px` |
|---|---|---|---|---|---|---|
| `grid-template-columns` | `repeat(3, 1fr)` | — | `repeat(2, 1fr)` | `repeat(2, 1fr)` | `1fr` | `1fr` |
| `gap` | `16px` | — | `12px` | `10px` | — | `8px` |
| `max-width` | `var(--container-article)` | — | — | — | — | — |
| `padding` | `0` | `0 30px` | `0 24px` | `0 20px` | `0 16px` | — |

#### Related Blog Card Image Height

| Default | `≤768px` | `≤640px` | `≤480px` | `≤320px` |
|---|---|---|---|---|
| `255px` | `180px` | `140px` | `280px` | `340px` |

---

## Typography System (Rendered Values)

> **See "Global Typography Classes (from App.css)" section above for the authoritative font-size tables.**
>
> The `App.css` classes use `!important` and override everything. The CSS `var(--font-size-*)` variables in `BlogDetails.css` are **NOT defined** in the Blog folder and are effectively overridden by the `!important` class values. Ignore them.

### Actual Rendered Font Sizes for Blog Elements

| Element | Class | Default | ≤1640px | ≤1024px | ≤768px | ≤480px |
|---|---|---|---|---|---|---|
| Listing page H1 | `headings-h2` | **67px** | 58px | 50px | 40px | 30px |
| Blog card title | `headings-h5` | **23px** | 23px | 23px | 23px | 23px |
| Hero title (Blog7+) | `headings-h3` | **54px** | 46px | 40px | 32px | 26px |
| Section heading | `headings-h3` | **54px** | 46px | 40px | 32px | 26px |
| Subtitle | `headings-h4` | **43px** | 36px | 30px | 24px | 20px |
| Social label | `headings-h5` | **23px** | 23px | 23px | 23px | 23px |
| Body paragraph | `bodyRegularText3` | **22px** | 20px | 18px | 16px | 14px |
| Meta / category | `bodyRegularText4` | **17px** | 15px | 14px | 13px | 12px |
| Small text | `bodyRegularText5` | **12px** | 11px | 10px | 9px | 8px |

> **Font-weight and line-height:** Headings get `font-weight: 600`, `line-height: 120%` from App.css. Body text gets `font-weight: 400`, `line-height: 150%` from App.css. These override any CSS or `sx` values for the same properties.

### Section Heading CSS Class (Layout Only)

```
CSS class: .section-heading (combined with headings-h3)
```

Font-size comes from `headings-h3` (`!important`). The `.section-heading` class only controls:

| Property | Default | `≤640px` | `≤320px` |
|---|---|---|---|
| `color` | `#ffffff` | — | — |
| `margin-bottom` | `15px` | `10px` | `8px` |

### Intro Paragraph CSS Class (Layout Only)

```
CSS class: .intro-paragraph (combined with bodyRegularText3)
```

Font-size comes from `bodyRegularText3` (`!important`). The `.intro-paragraph` class only controls:

| Property | Default | `≤768px` | `≤640px` | `≤480px` | `≤320px` |
|---|---|---|---|---|---|
| `lineHeight` | `1.8` | — | — | — | — |
| `fontWeight` | `500` | — | — | — | — |
| `color` | `#c2c2c4` | — | — | — | — |
| `margin-bottom` | `24px` | `18px` | `16px` | `14px` | `12px` |

> **Note:** The `!important` line-height from `bodyRegularText3` (150%) overrides the CSS `.intro-paragraph` line-height (1.8). However, some blog pages apply `lineHeight: 1.8` via MUI `sx` — since both `!important` and inline styles compete, the `!important` class value wins. The actual rendered line-height for intro paragraphs is **150% (1.5)**.

### Section Description CSS Class (Layout Only)

```
CSS class: .section-description (combined with bodyRegularText3)
```

Font-size comes from `bodyRegularText3` (`!important`). The `.section-description` class only controls:

| Property | Default | `≤640px` | `≤320px` |
|---|---|---|---|
| `margin-bottom` | `30px` | `20px` | `12px` |

### Lists

```
CSS class: .blog-content-list, .blog-check-list
```

| Property | Value |
|---|---|
| `margin` | `20px 0` |
| `padding-left` | `22px` (content-list), `0` (check-list) |
| `color` | `#c2c2c4` |

List items (font-size from `bodyRegularText3` when that class is applied):
| Property | Value |
|---|---|
| `margin-bottom` | `10px` |
| `line-height` | `150%` (from `bodyRegularText3 !important`) |

Check-list uses `✓` pseudo-element, color: `#71965a`, font-weight: `700`.

---

## Color System

### Background Colors

| Usage | Color |
|---|---|
| Main page background | `#1f1f1f` |
| Secondary/card background | `#161616` |
| Feature highlight box | `#2d5e38` |
| CTA card | `#111111` |
| Comment form | `#1d1d1f` |

### Text Colors

| Usage | Color |
|---|---|
| Primary body text | `#c2c2c4` |
| Headings / white text | `#ffffff` |
| Meta / secondary text | `#999` |
| Gray text | `#777` |
| Dark text (on light bg) | `#1f1f1f` |

### Accent Colors

| Usage | Color |
|---|---|
| Green accent (borders, solutions) | `#6aaa4b` |
| Green dark (labels, checkmarks) | `#71965a` |
| Green light (advantage border) | `#5fb878` |
| Blue (table header) | `#2c7dbf` |
| Orange (detail card headings) | `#fa7854` |
| Red (form required) | `#e74c3c` |
| Success green | `#6ee45a` |
| Read more (listing) | `#7fee64` |

### Border Colors

| Usage | Color |
|---|---|
| Section dividers | `#e4e7e2` |
| Table borders | `#d0d0d0` |
| Card borders | `#dedfdd` |
| Comment form border | `#525252` |

---

## Responsive Design

### Breakpoints Used

The project uses a **hybrid** breakpoint system:

**MUI breakpoints** (used in `sx` props):
| Key | Value |
|---|---|
| `xs` | `0px` |
| `sm` | `600px` |
| `md` | `900px` |
| `lg` | `1200px` |
| `xl` | `1536px` |

**CSS media query breakpoints** (used in `.css` files):
| Breakpoint | Range |
|---|---|
| `≤320px` | Tiny mobile |
| `≤360px` | Extra small mobile |
| `≤375px` | Extra small mobile (detail page) |
| `≤480px` | Small mobile |
| `≤600px` | Very small mobile (listing page) |
| `≤640px` | Mobile |
| `≤768px` | Tablet small |
| `≤900px` | Tablet (listing page) |
| `≤1024px` | Tablet (detail page) |
| `≤1440px` | Standard desktop |
| `≥1441px` | Large desktop |
| `≥1920px` | Extra large desktop |
| `≥2560px` | Ultra-wide |

### Responsive Behavior Summary

| Viewport Range | Blog Listing Grid | Blog Detail Hero | Main Content Padding |
|---|---|---|---|
| `320px–359px` | 1 col, `padding: 0 12px` | 1 col, `padding: 30px 8px` | `0 8px 15px` |
| `360px–479px` | 1 col, `padding: 0 12px` | 1 col, `padding: 40px 12px` | `0 12px 20px` |
| `480px–599px` | 1 col, `padding: 0 16px` | 1 col, `padding: 50px 16px` | `0 16px 30px` |
| `600px–639px` | 1 col, `padding: 0 16px` | 1 col, `padding: 60px 20px` | `0 20px 40px` |
| `640px–767px` | 2 col, `column-gap: 35px` | 1 col, `padding: 70px 24px` | `0 24px 50px` |
| `768px–899px` | 2 col, `column-gap: 35px` | 1 col, `padding: 80px 32px` | `0 24px 50px` |
| `900px–1024px` | 2 col, `column-gap: 60px` | 1 col, `padding: 80px 32px` | `0 30px 60px` |
| `1025px–1200px` | 2 col, `column-gap: 60px` | 2 col, `padding: 100px 5vw` | `0 30px 60px` |
| `1201px–1440px` | 2 col, `column-gap: 60px` | 2 col, `gap: 60px` | `0 0 80px` |
| `1441px–1919px` | 2 col | 2 col, `gap: 100px` | `0 0 80px` |
| `1920px–2559px` | 2 col, `padding: 160px 160px 0` | 2 col, `gap: 120px` | `0 0 80px` |
| `2560px+` | 2 col | 2 col, `gap: 140px` | `0 0 80px` |

### Key Responsive Rules

1. **Hero image hidden on xs (0–599px):** `display: { xs: "none", sm: "flex" }`
2. **Blog listing grid collapses at ≤640px:** `grid-template-columns: 1fr`
3. **Hero goes single-column at ≤1024px (CSS) / below lg (MUI):** `gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }`
4. **Related blogs: 3 cols → 2 cols at ≤768px → 1 col at ≤480px**
5. **All content sections lose max-width constraint at ≤1024px:** `max-width: 100%`

---

## Image System

### Blog Card Images (Listing)

| Property | Value |
|---|---|
| Container behavior | `overflow: hidden`, fixed height, `width: 100%` |
| Image `object-fit` | `cover` |
| `border-radius` | `12px` |
| Aspect ratio | Not fixed — uses fixed height container |

### Hero Image (Detail)

| Property | Value |
|---|---|
| `object-fit` | `cover` |
| `object-position` | `center` |
| `display` | `none` on xs, `flex` from sm |
| Width | Percentage-based, responsive |
| `max-width` | `none` |

### Content Images (Detail — Photo Sections)

```
CSS class: .photo-item img
```

| Property | Default | `≤768px` | `≤640px` | `≤480px` | `≤375px` | `≤320px` |
|---|---|---|---|---|---|---|
| `width` | `100%` | — | — | — | — | — |
| `height` | `800px` | `350px` | `300px` | `250px` | `200px` | `180px` |
| `max-width` | `800px` | — | — | — | — | — |
| `object-fit` | `cover` | — | — | — | — | — |
| `border-radius` | `12px` | — | — | — | — | `8px` |
| `margin-top` | `50px` | `35px` | `30px` | `20px` | — | `12px` |

### Photo Captions

```
CSS class: .photo-caption
```

| Property | Default | `≤640px` | `≤375px` | `≤320px` |
|---|---|---|---|---|
| `text-align` | `center` | — | — | — |
| `font-size` | `var(--font-size-lg)` | `var(--font-size-base)` | `var(--font-size-sm)` | `var(--font-size-sm)` |
| `line-height` | `1.35` | — | — | — |
| `font-weight` | `400` | — | — | — |
| `color` | `#c2c2c4` | — | — | — |
| `margin-top` | `7px` | — | `5px` | `4px` |

### Image Rules Summary

- **All images use `object-fit: cover`** — no squashing/stretching
- **Blog card images:** centered in their container, fixed height, overflow hidden
- **Hero images:** centered (`margin: 0 auto`), percentage width, hidden on mobile
- **Content images:** placed in photo sections, centered via their container
- **Captions:** always `text-align: center`
- **Never allow:** horizontal overflow, broken aspect ratios, image distortion

---

## Text Alignment

| Content | Alignment |
|---|---|
| All body text / paragraphs | **Left-aligned** (default) |
| All headings | **Left-aligned** (default) |
| Photo captions | **Center-aligned** |
| Comment section title | **Center-aligned** (`text-align: center`) |
| CTA card content | **Center-aligned** |
| Newsletter title | **Left-aligned** |
| Blog card content | **Left-aligned** |
| Images in photo sections | **Left-aligned** by default (some may be centered via container) |

**Do NOT globally center all blog text.** Only captions, CTA cards, and the comment title are centered.

---

## Reusable Components

The following should be implemented as **reusable components** because they are shared across multiple blog pages:

| Component | File | Props | Notes |
|---|---|---|---|
| `BlogCard` | `BlogCard.js` | `{ blog }` | Used on blog listing page, renders card with image, date, title, description, read more link |
| `BlogSocialAuthor` | `BlogSocialAuthor.js` | `{ socialTranslationKey, authorTranslationKey }` | Social sharing row + author card, placed after all blog content sections |
| `BlogBackButton` | `BlogBackButton.js` | none | Absolute-positioned back arrow in the hero section |
| `BlogCommentForm` | `BlogCommentForm.jsx` | none | Comment form with validation and EmailJS integration |
| `AnimateButton` | From parent project | `{ text1, text2 }` | Animated CTA button, used in comment form and CTA sections |

### Common Data Structure

Each blog entry in `BlogData.js` follows this shape:

```js
{
  id: Number,
  slug: String,         // URL slug
  category: String,     // e.g. "B2B & GESCHÄFT"
  date: String,         // e.g. "JUN 03, 2026"
  title: String,
  author: String,       // e.g. "ODETTE LAMKHIZNI"
  image: ImportedImage, // webpack-imported image asset
}
```

### Design Tokens Object (JS-side)

Every blog detail page defines a local `designTokens` object. This should be extracted into a shared utility:

```js
const designTokens = {
  colors: {
    bgDark: "#1f1f1f",
    bgLight: "#161616",
    bgBox: "#2d5e38",
    textPrimary: "#c2c2c4",
    textLight: "#999",
    textWhite: "#ffffff",
    textGray: "#777",
    accentGreen: "#6aaa4b",
    accentGreenDark: "#71965a",
    accentGreenLight: "#5fb878",
    accentBlue: "#2c7dbf",
    accentOrange: "#fa7854",
    borderLight: "#e4e7e2",
    borderMid: "#d0d0d0",
    borderDark: "#dedfdd",
  },
  fonts: {
    heading: "PowerGroteskTrialBoldf",
    body: "SatoshiRegular",
    bodyMedium: "SatoshiMedium",
  },
  containerMax: "1040px",
};
```

---

## MUI Implementation Guidelines

### Which MUI Components to Use

| Purpose | MUI Component |
|---|---|
| Generic containers / sections | `Box` with `component="section"` or `component="main"` |
| Text content | `Typography` with appropriate `component` prop (`h1`, `h2`, `h3`, `p`, `span`) |
| Images | `Box` with `component="img"` |
| Links | `Link` from `react-router-dom` (NOT MUI Link) |
| Buttons | `Box` with `component="button"` (back button) or `AnimateButton` (CTA) |
| Form inputs | `CustomTextField` from parent project |
| Notifications | `Snackbar` + `Alert` |

### Responsive Values in `sx`

Use MUI breakpoint object syntax:

```jsx
sx={{
  fontSize: {
    xs: "14px",
    sm: "16px",
    md: "18px",
    lg: "20px",
  },
}}
```

For custom breakpoints beyond MUI defaults, use CSS-in-JS media queries:

```jsx
sx={{
  fontSize: {
    lg: "20px",
  },
  "@media (min-width: 1920px)": {
    fontSize: "24px",
  },
  "@media (min-width: 2560px)": {
    fontSize: "28px",
  },
}}
```

### Class + sx Pattern

The existing code consistently combines **global CSS classes** with **MUI `sx` overrides**:

```jsx
<Typography
  component="h2"
  className="section-heading headings-h3"  // Base styles from CSS
  sx={{                                     // Responsive overrides
    "@media (max-width: 320px)": {
      px: 2,
    },
  }}
>
```

**Follow this pattern.** Use CSS classes for base typography and layout. Use `sx` for responsive adjustments and component-specific tweaks.

### Scroll to Top

Every blog detail page calls `window.scrollTo(0, 0)` in a `useEffect` on mount:

```jsx
useEffect(() => {
  window.scrollTo(0, 0);
}, []);
```

---

## EXACT CODE TEMPLATE — Copy This Structure

Every new blog detail page MUST follow this skeleton. This is extracted from the existing `Blog7page.js`.

### Complete Page Skeleton

```jsx
import React, { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import BlogBackButton from "./BlogBackButton";
import BlogSocialAuthor from "./BlogSocialAuthor";
import BlogcommentForm from "./BlogCommentForm";
import BlogData from "./BlogData";

// Import images
import AuthorImage from "./assets/author.jpg";
import HeroImage from "./assets/hero.jpg";

export default function Blog10Page() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const designTokens = {
    colors: {
      bgDark: "#1f1f1f",
      bgLight: "#161616",
      bgBox: "#2d5e38",
      textPrimary: "#c2c2c4",
      textLight: "#999",
      textWhite: "#ffffff",
      textGray: "#777",
      accentGreen: "#6aaa4b",
      accentGreenDark: "#71965a",
      accentGreenLight: "#5fb878",
      accentBlue: "#2c7dbf",
      accentOrange: "#fa7854",
      borderLight: "#e4e7e2",
      borderMid: "#d0d0d0",
      borderDark: "#dedfdd",
    },
    fonts: {
      heading: "PowerGroteskTrialBold",   // ← NO trailing "f"
      body: "SatoshiRegular",
      bodyMedium: "SatoshiMedium",
    },
    containerMax: "1040px",
  };

  // Related blogs — filter current blog out
  const relatedBlogs = BlogData.filter(
    (b) => b.slug !== "current-blog-slug"
  ).slice(0, 3);

  return (
    <div className="blog-details-page">

      {/* ========================= HERO SECTION ========================= */}
      <Box
        component="section"
        className="blog-hero-main"
        sx={{
          width: "100%",
          maxWidth: "none",
          margin: "0 auto",
          boxSizing: "border-box",
          position: "relative",
          padding: {
            xs: "50px 16px 60px",
            sm: "70px 24px 80px",
            md: "80px 32px 90px",
            lg: "100px 5vw 100px",
            xl: "110px 6vw 110px",
          },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "1fr",
            lg: "minmax(0, 1fr) minmax(0, 1fr)",
          },
          gap: {
            xs: "45px",
            sm: "55px",
            md: "60px",
            lg: "5vw",
            xl: "6vw",
          },
          alignItems: "center",
          "@media (max-width: 320px)": {
            padding: "45px 16px 55px",
          },
        }}
      >
        <BlogBackButton />

        {/* HERO CONTENT (LEFT COLUMN) */}
        <Box
          className="blog-hero-content"
          sx={{
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: { xs: 0, lg: "2vw", xl: "1vw" },
            boxSizing: "border-box",
          }}
        >
          {/* CATEGORY / META */}
          <Typography
            component="span"
            className="blog-hero-meta bodyRegularText4"
            sx={{
              textTransform: "uppercase",
              color: designTokens.colors.textLight,
              marginBottom: { xs: "14px", sm: "16px", md: "18px", lg: "20px" },
            }}
          >
            {t("blog10Page.hero.category")} · {t("blog10Page.hero.date")}
          </Typography>

          {/* TITLE */}
          <Typography
            component="h1"
            className="blog-hero-title headings-h3"
            sx={{ width: "100%", boxSizing: "border-box" }}
          >
            {t("blog10Page.hero.title")}
          </Typography>

          {/* AUTHOR */}
          <Box
            className="blog-author-info"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: "10px", sm: "12px", md: "14px" },
              marginTop: { xs: "28px", sm: "32px", md: "36px", lg: "40px" },
            }}
          >
            <Box
              component="img"
              src={AuthorImage}
              alt={t("blog10Page.author.name")}
              className="blog-author-image"
              sx={{
                width: { xs: "48px", sm: "56px", md: "64px", lg: "72px", xl: "80px" },
                height: { xs: "48px", sm: "56px", md: "64px", lg: "72px", xl: "80px" },
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                display: "block",
              }}
            />
            <Box
              className="blog-author-details"
              sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
            >
              <Typography component="p" className="blog-hero-meta bodyRegularText3">
                {t("blog10Page.author.name")}
              </Typography>
              <Typography component="p" className="blog-company-name bodyRegularText3">
                {t("blog10Page.author.company")}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* HERO IMAGE (RIGHT COLUMN) — HIDDEN ON xs */}
        <Box
          className="blog-hero-image-box"
          sx={{
            width: "100%",
            minWidth: 0,
            display: { xs: "none", sm: "flex", md: "flex", lg: "flex" },
            justifyContent: { xs: "center", sm: "center", md: "center", lg: "center" },
            alignItems: "center",
            boxSizing: "border-box",
            overflow: "visible",
          }}
        >
          <Box
            component="img"
            className="blog-hero-image"
            src={HeroImage}
            alt={t("blog10Page.hero.imageAlt")}
            sx={{
              width: {
                sm: "75%", md: "65%", lg: "70%", xl: "75%",
                "@media (min-width: 1920px)": "80%",
                "@media (min-width: 2560px)": "85%",
              },
              height: {
                sm: "300px", md: "450px", lg: "500px", xl: "550px",
                "@media (min-width: 1920px)": "480px",
                "@media (min-width: 2560px)": "600px",
              },
              minHeight: 0,
              maxHeight: {
                sm: "300px", md: "450px", lg: "500px", xl: "550px",
                "@media (min-width: 1920px)": "480px",
                "@media (min-width: 2560px)": "600px",
              },
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              margin: "0 auto",
              maxWidth: "none",
              boxSizing: "border-box",
            }}
          />
        </Box>
      </Box>

      {/* ========================= MAIN ARTICLE ========================= */}
      <main className="blog-main-article">

        {/* INTRO SECTION */}
        <section className="intro-section">
          <Typography
            component="h4"
            className="headings-h4"
            sx={{
              mt: 3,
              color: "#fff",
              "@media (max-width: 320px)": { px: 2 },
            }}
          >
            {t("blog10Page.intro.subtitle")}
          </Typography>
        </section>

        <hr className="target-divider" />

        {/* CONTENT SECTION — repeat this pattern for each section */}
        <section className="technical-section">
          <Typography
            component="h2"
            className="section-heading headings-h3"
            sx={{
              "@media (max-width: 320px)": { px: 2 },
            }}
          >
            {t("blog10Page.section1.title")}
          </Typography>

          <Typography
            component="p"
            className="section-description bodyRegularText3"
            sx={{
              mt: 2,
              "@media (max-width: 320px)": { px: 2 },
            }}
          >
            {t("blog10Page.section1.paragraph1")}
          </Typography>
        </section>

        <hr className="target-divider" />

        {/* ... more sections following the same pattern ... */}

        {/* SOCIAL + AUTHOR */}
        <BlogSocialAuthor />

        {/* COMMENT FORM */}
        <BlogcommentForm />

        {/* ========================= RELATED BLOGS ========================= */}
        <section className="blog-related-section">
          <div className="blog-related-container">
            {relatedBlogs.map((relatedBlog) => (
              <article className="blog-related-card" key={relatedBlog.slug}>
                <Link
                  to={`/${lang}/blogs/${relatedBlog.slug}`}
                  className="blog-related-link"
                >
                  <img
                    src={relatedBlog.image}
                    alt={relatedBlog.title}
                    className="blog-related-image"
                  />
                  <Typography
                    component="div"
                    className="blog-related-category bodyRegularText3"
                    sx={{
                      "@media (max-width: 320px)": { px: 2 },
                    }}
                  >
                    {relatedBlog.category}
                  </Typography>
                  <Typography
                    component="h3"
                    className="blog-related-title bodyRegularText3"
                    sx={{
                      mt: 1,
                      "@media (max-width: 320px)": { px: 2 },
                    }}
                  >
                    {relatedBlog.title}
                  </Typography>
                </Link>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
```

### Key Differences From What AIs Typically Get Wrong

| What AIs do wrong | What existing code actually does |
|---|---|
| `<Box component="main">` with `sx` for main article | `<main className="blog-main-article">` (plain HTML) |
| `<Box component="section">` with `sx` for content | `<section className="technical-section">` (plain HTML) |
| `gridTemplateColumns: { lg: "1fr 1fr" }` | `lg: "minmax(0, 1fr) minmax(0, 1fr)"` |
| No `maxWidth: "none"` on hero | `maxWidth: "none"` explicitly set |
| No `boxSizing: "border-box"` on hero content | Always present |
| Missing `minWidth: 0` on hero columns | Always present |
| Hardcoded text in JSX | All text via `t("key")` |
| Custom wrapper components `<Text>`, `<Heading>` | Direct `<Typography>` every time |
| Missing 320px breakpoint | `"@media (max-width: 320px)": { px: 2 }` on every text element |
| No `maxHeight` on hero image | `maxHeight` matches `height` at each breakpoint |
| Missing 1920px/2560px hero image sizes | Both media queries present |
| No related blogs section | Always present with 3 related blog cards |
| Font name `PowerGroteskTrialBoldf` | `PowerGroteskTrialBold` (no trailing f) |
| New CSS classes for custom layouts | Use MUI `sx` inline for custom elements |
| Missing `overflow: "visible"` on hero image box | Always present |

---

## Do / Don't

### Do

- ✅ Reuse `BlogSocialAuthor`, `BlogBackButton`, `BlogCommentForm`, `BlogCard`
- ✅ Reuse the existing Header and Footer
- ✅ Use the `designTokens` object for colors and fonts
- ✅ Use `className` + `sx` hybrid pattern
- ✅ Use CSS custom properties from `:root` in CSS files
- ✅ Use `1040px` max-width for main blog content (from `designTokens.containerMax`)
- ✅ Hide hero image on `xs` (`display: { xs: "none", sm: "flex" }`)
- ✅ Use `object-fit: cover` for all images
- ✅ Use `react-i18next` `t()` for all user-facing text
- ✅ Use `<hr className="target-divider" />` between sections
- ✅ Test from `320px` to `2560px`
- ✅ Use `PowerGroteskTrialBold` for headings (NO trailing "f")
- ✅ Use `SatoshiRegular` for body text
- ✅ Use `<main className="blog-main-article">` for the content wrapper (plain HTML)
- ✅ Use `<section className="technical-section">` for content sections (plain HTML)
- ✅ Use `<div className="blog-details-page">` as the page wrapper
- ✅ Include Related Blogs section at the bottom of every blog page
- ✅ Add `"@media (max-width: 320px)": { px: 2 }` to all text elements in main content
- ✅ Use `minmax(0, 1fr)` in hero grid (NOT `1fr`)
- ✅ Copy the exact code template from the "EXACT CODE TEMPLATE" section above

### Don't

- ❌ Create a new Header or Footer
- ❌ Use any width other than `1040px` for the main content max-width
- ❌ Apply max-width restriction to the hero section
- ❌ Show the hero image on `xs` breakpoint
- ❌ Use `object-fit: contain` or `object-fit: fill` on blog images
- ❌ Center-align body paragraphs (only captions and CTA are centered)
- ❌ Introduce Tailwind, Bootstrap, or styled-components
- ❌ Redesign, improve, or modernize the existing design
- ❌ Copy actual blog article text into new pages
- ❌ Create duplicate components for functionality that already exists
- ❌ Use hardcoded strings instead of `t()` translation keys
- ❌ Forget `word-break` / `overflow-wrap` for long URLs or words
- ❌ Use fixed pixel widths for responsive content that should be fluid
- ❌ **Invent new CSS classes** — only use classes from `BlogDetails.css` and `Blog.css`
- ❌ **Create wrapper components** like `<Text>`, `<Heading>`, `<Label>`, `<Figure>`
- ❌ **Use `<Box component="main">` or `<Box component="section">`** for main article / content sections
- ❌ **Use `1fr 1fr`** in hero grid — must be `minmax(0, 1fr) minmax(0, 1fr)`
- ❌ **Use `defaultValue` fallbacks** in `t()` calls
- ❌ **Omit the Related Blogs section** at the bottom
- ❌ **Omit `maxHeight`** on the hero image
- ❌ **Omit 1920px and 2560px** media queries on the hero image
- ❌ **Add decorative elements** not in the existing design (colored bars, rails, green dividers)
- ❌ **Use `PowerGroteskTrialBoldf`** (wrong name — correct is `PowerGroteskTrialBold`)

---

## Validation Checklist

Before considering a blog page complete, verify every item:

### Shared Components
- [ ] Existing Header reused (not recreated)
- [ ] Existing Footer reused (not recreated)
- [ ] `BlogSocialAuthor` component used for social + author section
- [ ] `BlogBackButton` component used in hero section
- [ ] `BlogCommentForm` component used for comments
- [ ] `AnimateButton` component used for CTA buttons

### Blog Listing Page
- [ ] Blog listing page uses `.blogs-page` with `background: #1f1f1f`
- [ ] Blog listing intro section `max-width: 1200px`, centered
- [ ] Blog listing grid `max-width: 1200px`, centered
- [ ] Grid uses `repeat(2, minmax(0, 1fr))` on desktop
- [ ] Grid collapses to `1fr` at `≤640px`
- [ ] Column gap: `60px` (desktop), `35px` (tablet)
- [ ] Row gap: `70px` (desktop), `55px` (mobile)
- [ ] Blog cards use correct image height progression
- [ ] Blog card images have `border-radius: 12px`
- [ ] Blog card images use `object-fit: cover`
- [ ] Read more link color is `#7fee64`
- [ ] Ultra-wide (1920px+) padding is `160px 160px 0`

### Blog Detail Page — Hero
- [ ] Hero section has NO max-width restriction
- [ ] Hero uses full available width
- [ ] Hero is a 2-column grid on `lg` and above
- [ ] Hero collapses to 1-column below `lg` (MUI) / `≤1024px` (CSS)
- [ ] Hero image is **hidden** on `xs` (0–599px)
- [ ] Hero image is visible from `sm` (600px) upward
- [ ] Hero image uses `object-fit: cover`
- [ ] `BlogBackButton` is positioned absolutely in the hero
- [ ] Author info is present in the hero with responsive avatar sizes
- [ ] Category meta uses uppercase, `#999` color, small font

### Blog Detail Page — Content
- [ ] Main content `maxWidth` is `1040px`
- [ ] Main content is horizontally centered (`margin: 0 auto`)
- [ ] Horizontal padding decreases on smaller viewports
- [ ] Section dividers use `<hr className="target-divider" />`
- [ ] Intro paragraph uses `SatoshiRegular` with `line-height: 1.8`
- [ ] Section descriptions use `margin-bottom: 30px` (desktop) / `20px` (mobile)

### Typography
- [ ] Headings use `PowerGroteskTrialBoldf` font family
- [ ] Body uses `SatoshiRegular` font family
- [ ] H2 semantic heading uses `headings-h3` class
- [ ] H4 subtitle uses `headings-h4` class
- [ ] Blog card titles use `headings-h5` class
- [ ] Paragraphs use `bodyRegularText3` class
- [ ] Meta/category uses `bodyRegularText4` class

### Colors
- [ ] Page background is `#1f1f1f`
- [ ] Primary text color is `#c2c2c4`
- [ ] Heading color is `#ffffff`
- [ ] Meta/secondary text is `#999`
- [ ] Green accent is `#6aaa4b`

### Images
- [ ] All images use `object-fit: cover`
- [ ] No image squashing or stretching
- [ ] No horizontal overflow from images
- [ ] Photo captions are center-aligned
- [ ] Hero image width uses percentage values, not fixed pixels
- [ ] Content images have `border-radius: 12px`

### Responsive Behavior
- [ ] Works correctly at `320px`
- [ ] Works correctly at `360px`
- [ ] Works correctly at `375px`
- [ ] Works correctly at `390px`
- [ ] Works correctly at `414px`
- [ ] Works correctly at `480px`
- [ ] Works correctly at `600px`
- [ ] Works correctly at `768px`
- [ ] Works correctly at `900px`
- [ ] Works correctly at `1024px`
- [ ] Works correctly at `1280px`
- [ ] Works correctly at `1440px`
- [ ] Works correctly at `1600px`
- [ ] Works correctly at `1920px`
- [ ] Works correctly at `2560px`
- [ ] No horizontal overflow at any viewport
- [ ] No text overflow at any viewport
- [ ] Long titles wrap correctly
- [ ] Author section wraps correctly on mobile
- [ ] Social section wraps correctly on mobile

### Other
- [ ] All user-facing text uses `t()` from `react-i18next`
- [ ] Blog data follows the `BlogData.js` structure
- [ ] `window.scrollTo(0, 0)` called on mount
- [ ] No unnecessary new styling system introduced
- [ ] CSS custom properties (`:root`) used where applicable
- [ ] `designTokens` object used in `sx` props
- [ ] Blog page navigates correctly using `react-router-dom`

---

## Layout Tokens Summary

| Token | Value | Usage |
|---|---:|---|
| Blog Listing Intro Max Width | `1200px` | Listing intro + grid container |
| Blog Listing Grid Columns | `2` | Desktop listing grid |
| Blog Listing Grid Column Gap | `60px` | Desktop gap |
| Blog Listing Grid Row Gap | `70px` | Desktop row gap |
| Blog Listing Grid Mobile Gap | `55px` | Mobile (single column) |
| Blog Content Max Width | `1040px` | Main blog detail content |
| Blog Hero Max Width | `none` | Hero has no width restriction |
| Section Divider Margin Bottom | `20px` | `<hr>` between sections |
| Intro Section Margin Bottom | `60px` | After intro paragraphs |
| Technical Section Margin | `80px auto` | Main content sections |
| Photo Section Margin Top | `40px` | Before photo galleries |
| Section Description Margin Bottom | `30px` (desktop) / `20px` (mobile) | After section paragraphs |
| Blog Card Image Border Radius | `12px` | Card images |
| Blog Card Image Max Width | `450px` | Card image container |
| Author Avatar Default Size | `85px` (lg) | Author card avatar |
| Hero Image Default Height | `500px` (lg) | Hero image |
| Comment Form Padding | `60px` | Desktop comment form |
| Related Blogs Default Columns | `3` | Desktop related grid |
| CTA Card Max Width | `720px` | Pizza CTA card |