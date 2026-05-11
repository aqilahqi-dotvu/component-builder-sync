---
name: settings-dotvu-buttons
description: "Rules and patterns for using Button and IconButton controls in editor.js — mandatory style prop, primary vs secondary variants, icon-only buttons with IconButton, available icons from @icons, children vs text prop, and disabled/selected states. Use when adding any clickable button control to editor settings."
---

# settings-dotvu-buttons

Use this skill whenever you add a `Button` or `IconButton` to `editor.js`.

---

## Button

### Import

```js
import { Button } from "@ui";
```

### Props

| Prop | Type | Required | Notes |
|---|---|---|---|
| `style` | `"primary" \| "secondary"` | **MANDATORY** | Never omit. Controls visual weight. |
| `onClick` | function | Yes | Click handler. |
| `text` | string | No | Button label via prop. Can use children instead. |
| `disabled` | boolean | No | Greys out and prevents interaction. |
| `selected` | boolean | No | Renders the button in a selected/active state. |
| `title` | string | No | Tooltip shown on hover. |

> **Rule:** `style` is always required. A `Button` without `style` will not render correctly.

### Label: `text` prop vs children

Both work. Prefer `text` for simple labels; use children when you need to compose content (e.g. an icon + label inline):

```jsx
// via prop
<Button style="primary" text="Add answer" onClick={handleAdd} />

// via children
<Button style="secondary" onClick={handleDelete}>
  ×
</Button>
```

### Primary button

Use for the main, affirmative action in a section (add, confirm, submit).

```jsx
<Button
  style="primary"
  text="+ Add item"
  onClick={() => addItem()}
/>
```

### Secondary button

Use for destructive, cancel, or lower-priority actions.

```jsx
<Button
  disabled={items.length <= 2}
  style="secondary"
  onClick={() => deleteItem(item.id)}
>
  ×
</Button>
```

### Guarding destructive actions with `disabled`

Always disable a delete/remove button when removing the item would violate a minimum count:

```jsx
<Button
  disabled={answers.length <= 2}
  style="secondary"
  title="Cannot remove — minimum 2 answers required"
  onClick={() => deleteAnswer(questionId, answer.id)}
>
  ×
</Button>
```

---

## IconButton

`IconButton` renders an icon-only button. Use it for compact row-level actions (delete, edit, move) where a text label would take too much space.

### Import

```js
import { IconButton } from "@ui";
import { deleteIcon } from "@icons";
```

> **Important:** `@icons` can only be imported in `editor.js`. Never import from `@icons` in `live.js`.

### Props

| Prop | Type | Required | Notes |
|---|---|---|---|
| `icon` | SVG string | Yes | Pass an icon from `@icons`. |
| `onClick` | function | Yes | Click handler. |
| `style` | `50 \| 40 \| 30 \| 25 \| "fill-height"` | No | Button size in px. Default: `50`. |
| `disabled` | boolean | No | Greys out and prevents interaction. |
| `className` | string | No | Additional CSS classes. |

### Example

```jsx
import { IconButton } from "@ui";
import { deleteIcon, editIcon } from "@icons";

<IconButton
  icon={deleteIcon}
  style={40}
  title="Delete item"
  onClick={() => deleteItem(item.id)}
/>

<IconButton
  icon={editIcon}
  style={40}
  title="Edit item"
  onClick={() => openDrawer(item.id)}
/>
```

---

## Available icons

All icons are imported from `@icons` (editor only):

| Import name | Use for |
|---|---|
| `addIcon` | Add / create actions |
| `editIcon` | Open edit drawer or form |
| `deleteIcon` | Remove / delete actions |
| `duplicateIcon` | Duplicate / copy actions |
| `arrowUpIcon` | Move up |
| `arrowDownIcon` | Move down |
| `arrowLeftIcon` | Move left / back |
| `arrowRightIcon` | Move right / forward |
| `searchIcon` | Search / filter |
| `settingsIcon` | Open settings |
| `closeIcon` | Close / dismiss |
| `infoIcon` | Help / info tooltip |

```js
import {
  addIcon,
  editIcon,
  deleteIcon,
  duplicateIcon,
  arrowUpIcon,
  arrowDownIcon,
  searchIcon,
  closeIcon,
} from "@icons";
```

---

## Choosing between Button and IconButton

| Situation | Use |
|---|---|
| Primary action in a section (add, submit) | `Button style="primary"` |
| Secondary or destructive action with a text label | `Button style="secondary"` |
| Compact row-level icon-only action (delete, edit) | `IconButton` |
| Three-dot contextual menu per row | `OptionsMenuRootButton` (see settings-table skill) |

---

## Common mistakes

- **Missing `style` prop** — `Button` will not render correctly without it. Always set `"primary"` or `"secondary"`.
- **Importing `@icons` in `live.js`** — icons are editor-only. Never use `@icons` in `live.js`.
- **Using `Button` for icon-only actions in tight spaces** — use `IconButton` instead; it sizes itself to the icon with no wasted whitespace.
- **Forgetting `disabled` guard on min-count removals** — always disable delete buttons when at the minimum allowed count.
