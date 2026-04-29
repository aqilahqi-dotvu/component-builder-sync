---
applyTo: "**/{common,editor,live}.js,**/{common,editor,live}/index.js"
description: "Use when creating or updating Dot.vu component files and keep code in a consistent top-down structure, especially in live.js React components."
---

# Component File Structure

When creating a new Dot.vu component or making a meaningful update to an existing one, keep the code organized in a predictable top-down order.

This structure exists to improve scanability and consistency, not to justify extra abstraction. Prefer straightforward code over flexible-looking abstractions that are only used once.

Apply this structure when:

- creating a new component
- substantially refactoring a touched file
- adding a new block of behavior that would otherwise make the file harder to scan

Do not reorder large existing files only for style if the user asked for a small targeted fix. Apply the structure to the code you touch unless a broader cleanup is clearly warranted.

## Avoid overengineering

- Prefer inline logic over a helper when the logic is short and only used once.
- Extract helpers only when they improve readability, are reused, or isolate a real unit of behavior.
- Extract render pieces only when they reduce complexity in the main return block or are reused.
- Do not add configuration layers, generic factories, or abstraction for hypothetical reuse.
- Do not split behavior across multiple helpers when one local block is easier to read.
- Favor small, obvious components and functions over clever structure.

## Preferred section order in live.js

For `live.js` or `live/index.js`, use this order and keep the section comments when writing new code:

```js
// 1. Imports
// 2. Constants
// 3. Styles function
// 4. Small reusable helpers
// 5. Small reusable render/template pieces
// 6. Main component
```

Inside the exported `Component`, keep this order:

```js
// 6a. Hooks first
// 6b. Derived variables
// 6c. Event handlers
// 6d. Effects
// 6e. Styles
// 6f. Return/template
```

Follow these rules in `live.js`:

- `const { s } = useScaler()` must remain the first line inside `Component`.
- Keep `getStyles` near the top of the file, above helpers and render pieces.
- Keep component CSS in one block. If you use `getStyles`, it should return the single CSS string used by the file.
- Keep small helpers pure when possible.
- Do not call `s()` outside `Component`.
- Use component-prefixed class names for selectors and JSX `className` values.
- Extract small render pieces only when they are reused or materially simplify the main return block.
- Keep the return block last inside `Component`.

## Preferred structure in editor.js

For `editor.js` or `editor/index.js`, use the same top-down discipline:

```js
// 1. Imports
// 2. Constants
// 3. Editor scoped styles or static config helpers
// 4. Small reusable helpers
// 5. Small reusable render pieces
// 6. Exported editor functions
```

When an exported editor function grows beyond a simple mapping function, organize its internals like this when practical:

- hooks first
- derived values next
- handlers after that
- JSX or returned configuration last

When `editor.js` uses class names, keep them component-prefixed and define them in one editor CSS block or one styles helper instead of splitting them across multiple blocks.

## Preferred structure in common.js

For `common.js` or `common/index.js`, keep the file simple:

```js
// 1. Imports
// 2. Constants
// 3. Small reusable helpers
// 4. Exported shared functions
```

Put shared normalization helpers above exported functions such as `getInitialState`.

## Update behavior

When updating an existing component:

- preserve existing exports and behavior unless the user asked to change them
- prefer moving newly added code into the nearest correct section instead of appending it at the bottom
- if the touched file is already close to this structure, finish the cleanup while making the requested change
- if the file is far from this structure and the requested change is small, avoid noisy reorder-only churn

## Goal

Optimize for files that are easy to scan from top to bottom: imports, constants, styling, helpers, small render pieces, then the main exported behavior.