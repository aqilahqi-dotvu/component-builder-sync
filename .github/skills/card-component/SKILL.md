---
name: card-component
description: Rules and patterns for card-based Dot.vu components — card structure, single vs multiple cards, content fields, settings sections, design consistency, and scaling. Use when building or editing a component with one or more cards.
---

# Card Component Skill

## Card structure

Every card must have a clear and consistent structure. A standard card may include:

- Container / card wrapper
- Optional image or icon area
- Optional badge or label
- Title
- Optional subtitle / subheadline
- Optional description
- Optional button
- Optional secondary content area

Spacing rules:

- Padding between card border and content
- Gap between text elements
- Gap between image/icon and text
- Gap between button and content
- Responsive spacing using `s()` in `live.js`

Do not let text touch the card border. Do not use fixed container widths. Do not add raw `<style>` tags. Wrap all new px values in `s()`.

## Single card vs multiple cards

**Single card:** Use simple state fields. Avoid list infrastructure. Keep settings minimal.

**Multiple cards:**

- Each item must use `getUniqueId()` for its `id`
- Use `TableContainer` with Add, Edit, Duplicate, Delete, and Reorder
- Render cards consistently from the list — do not hardcode repeated content

## Content fields

Only add fields that match the requested card purpose. Common fields:

- `title`
- `subtitle`
- `description`
- `buttonText`
- `buttonUrl`
- `image`
- `icon`
- `badgeText`

Preserve existing field names. Add new state defaults before `...state`. Do not remove existing state unless clearly unused and safe.

## Settings structure

Use tabs and sections consistently. Recommended grouping:

**Content tab** — card content, title, subtitle, description, button text/link, image/icon, list management (if multiple cards)

**Card Style tab** — background color, border color, border width, border radius, padding, gap, shadow, alignment

**Typography tab** — title font/size/weight/color, subtitle font/size/color, description font/size/color

**Button Style tab** — only if a button exists. Button text color, background, hover color, border radius, padding, alignment.

**Image / Icon tab** — only if image or icon is used. Visibility, size, border radius, position, object-fit.

**Animation tab** — only if animation was explicitly requested.

## Design consistency

When the user asks to reuse a design or behavior from another component:

- Inspect the referenced component first
- Reuse the same state structure, settings pattern, and visual logic where practical
- Do not invent a new UI pattern when an existing one already solves the problem

Consistency is more important than creative redesign.

## Scaling rules

In `live.js`:

- `const { s } = useScaler()` must be the first line inside `Component`
- All new pixel values must be wrapped in `s()`
- Do not use `maxWidth`, `minWidth`, or fixed container widths unless the component already requires them
- Do not change height behavior unless explicitly requested
- Keep `// HEIGHT_PATTERN:` accurate

## Pre-submit checklist (card-specific)

- [ ] Card content has proper padding from the card border
- [ ] Text elements have proper spacing between them
- [ ] Multiple card lists use `getUniqueId()` per item
- [ ] Table lists include Add, Edit, Duplicate, Delete, and Reorder when appropriate
- [ ] Typography settings cover all visible text elements
- [ ] Button settings included only if a button exists
- [ ] Image/icon settings included only if image/icon exists
- [ ] Animation settings included only if explicitly requested
- [ ] No hardcoded card content when a list is used
