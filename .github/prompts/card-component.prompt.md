---
agent: dotvu-component-builder
description: Create or modify a Dot.vu component that uses card-based UI
---

# Dot.vu Card Component Builder

Use this prompt when creating or editing any Dot.vu component that contains one or more cards.

The goal is to keep all card-based components consistent in structure, UI behavior, settings, spacing, and reusable patterns across different components.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:.github/prompts/dotvu-api-reference.prompt.md
#file:common.js
#file:editor.js
#file:live.js

## Step 1 - Clarify only what is needed

Before writing code, ask only the most important clarification questions needed to build the card component properly.

Ask a maximum of 5 questions.

Prioritize questions about:

1. Is this component a single card or multiple cards?
2. What content should each card include?
   - Title
   - Subtitle / subheadline
   - Description
   - Image / icon
   - Button
   - Badge / label
   - Price / stats / extra fields
3. Should cards be manually added as a list in settings?
4. Is animation needed?
5. Should this card reuse a design, setting, or behavior from another existing component?

Do not ask too many detailed style questions unless the user specifically requests full design control.

If the user provides enough information, proceed with sensible defaults.

## Step 2 - Inspect before editing

Before writing code, identify:

- Current `// HEIGHT_PATTERN:` in `live.js`
- Whether the component already has card-like UI
- Whether cards are single static content or dynamic/repeatable items
- Existing settings tabs and sections
- Existing state fields in `getInitialState`
- Existing actions and triggers
- Existing data fields and fonts
- Existing dynamic lists and whether they use `TableContainer`
- Existing use of dynamic values, action sets, or audience data
- Existing spacing, padding, typography, button, image, icon, and animation patterns
- Any reusable pattern from another component if the user references one

## Step 3 - Card structure rules

Every card-based component must have a clear and consistent structure.

A standard card may include:

- Container / card wrapper
- Optional image or icon area
- Optional badge or label
- Title
- Optional subtitle / subheadline
- Optional description
- Optional button
- Optional secondary content area

Each card must include proper spacing:

- Padding between card border and content
- Gap between text elements
- Gap between image/icon and text
- Gap between button and content
- Responsive spacing using the component scaler where required

Do not let text touch the card border.

Do not use fixed container widths unless already required by the component pattern.

Do not introduce raw `<style>` tags.

Do not add new px values in `live.js` without wrapping them with `s()`.

## Step 4 - Single card vs multiple cards

If the component only needs one card:

- Use simple state fields for the card content
- Avoid unnecessary dynamic list infrastructure
- Keep settings simple and easy to edit

If the component needs multiple cards:

- Use a repeatable card list in state
- Each card item must use `getUniqueId()`
- Use `TableContainer` if the component already uses it or if the list needs proper Add, Edit, Duplicate, Delete, and Reorder behavior
- Cards should render consistently from the list
- Do not hardcode repeated card content

For multiple cards, include controls when appropriate:

- Add card
- Edit card
- Duplicate card
- Delete card
- Reorder card

## Step 5 - Content fields

Only add content fields that match the requested card purpose.

Common card fields:

- `title`
- `subtitle`
- `description`
- `buttonText`
- `buttonUrl`
- `image`
- `icon`
- `badgeText`

Preserve existing field names unless the user specifically asks to rename them.

When adding new state defaults, add them before `...state`.

Do not remove existing state unless clearly unused and safe.

## Step 6 - Settings structure

Card components should have predictable settings.

Use tabs and sections consistently.

Recommended settings sections:

### Content

Controls for:

- Card content
- Title
- Subtitle / subheadline
- Description
- Button text
- Button link
- Image / icon
- Card list management if multiple cards are used

### Card Style

Controls for:

- Card background color
- Card border color
- Border width
- Border radius
- Card padding
- Card gap
- Shadow
- Alignment

### Typography

Controls for:

- Title font
- Title font size
- Title font weight
- Title color
- Subtitle font
- Subtitle font size
- Subtitle color
- Description font
- Description font size
- Description color

### Button Style

Only include if the card uses a button.

Controls for:

- Button visibility
- Button text color
- Button background color
- Button hover color if supported
- Button border radius
- Button padding
- Button alignment

### Image / Icon Style

Only include if image or icon is used.

Controls for:

- Image/icon visibility
- Size
- Border radius
- Position
- Fit / object behavior if image-based

### Animation

Only include if requested, or provide a simple optional animation setting if the component commonly needs it.

Controls may include:

- Animation enabled
- Animation type
- Animation duration
- Animation delay
- Animation easing

Do not add animation if the user did not request it and the component does not need it.

## Step 7 - Design consistency rules

When the user asks to reuse a design, behavior, or setting from another component:

- Inspect the referenced component first
- Reuse the same state structure where practical
- Reuse the same settings pattern where practical
- Reuse the same visual logic where practical
- Do not create a completely different implementation for the same behavior

If a similar feature already exists in another component, follow that pattern unless there is a good reason not to.

Consistency is more important than creative redesign.

Do not invent a new UI pattern when an existing Dot.vu component pattern already solves the problem.

## Step 8 - Responsive and scaling rules

In `live.js`:

- Keep `const { s } = useScaler()` as the first line inside `Component`
- Use `s()` for new pixel-based values
- Do not add unscaled spacing values
- Do not change height behavior unless explicitly requested
- Keep `// HEIGHT_PATTERN:` accurate
- Do not add `maxWidth`, `minWidth`, or fixed container widths unless the component already uses them and it is required

## Step 9 - Dot.vu-specific rules

Follow existing Dot.vu component conventions.

Do not add:

- Invented imports
- Raw `<style>` tags
- Unsupported external libraries
- `@data`
- `DynamicValueInput`
- `ActionSet`
- Audience data
- BREAKPOINT_AWARE infrastructure

Unless the existing component already uses them or the user explicitly asks for them.

Settings changes must use:

- `<Section>`
- Clear heading labels
- `<SettingItem>`

## Step 10 - Update all affected files

Update all files needed to keep the component working consistently.

Usually check and update:

- `common.js`
- `editor.js`
- `live.js`

Also update when needed:

- Data fields
- Fonts
- Actions
- Triggers
- Help text / help article
- Any shared helper functions

Do not refactor unrelated working code.

Make the smallest safe change.

## Step 11 - Pre-submit checklist

Before final response, confirm:

- [ ] All affected files updated
- [ ] No duplicate exported functions introduced
- [ ] `// HEIGHT_PATTERN:` is still accurate
- [ ] No new px values in `live.js` missing `s()`
- [ ] `const { s } = useScaler()` is still the first line inside `Component`
- [ ] No invented imports
- [ ] No raw `<style>` tags
- [ ] No `maxWidth`, `minWidth`, or fixed container widths unless already required
- [ ] Card content has proper padding from the card border
- [ ] Text elements have proper spacing
- [ ] Settings use `<Section>`, heading labels, and `<SettingItem>`
- [ ] Typography settings are available for relevant text elements
- [ ] Button settings are included if a button exists
- [ ] Image/icon settings are included if image/icon exists
- [ ] Animation settings are included only if needed or requested
- [ ] Multiple card lists use `getUniqueId()`
- [ ] Table lists include Add, Edit, Duplicate, Delete, and Reorder when appropriate
- [ ] Help article still matches the component
- [ ] Data fields, actions, triggers, fonts, and live state still reflect the component
- [ ] Referenced reusable behavior from another component has been matched consistently

## Step 12 - Final response

Summarize:

- Files changed
- Card behavior changed
- Settings added or changed
- Reused patterns from other components, if any
- Any assumptions made
- Things to test inside Dot.vu
