---
name: textarea
description: "Rules and patterns for using a native HTML textarea in editor.js — when to prefer it over TextInput, consistent styling, onChange handler, newline handling, and rows sizing. Use when an editor field needs multi-line text input."
---

# Textarea — Usage Rule

## Rule

`TextArea` is **not** available in `@ui`. Use a native HTML `<textarea>` when a text field holds long content (e.g. body copy, descriptions, code snippets) where a single-line `TextInput` would make the text hard to read and edit.

- **Do** use `<textarea>` for any field where the expected value is more than one short sentence.
- **Do** always pair it with a `Label` in the same `<SettingItem>`, exactly like `TextInput`.
- **Do** apply the shared style object (see Patterns) so it visually matches the editor.
- **Do** set `rows` to reflect the expected content length (default: `3`, body copy: `5–6`).
- **Do** allow `resize: 'vertical'` so editors can adjust height if needed.
- **Do not** use `resize: 'none'` — it traps editors in a fixed box.
- **Do not** use `resize: 'horizontal'` or `resize: 'both'` — it breaks the layout.
- **Do not** import anything extra — `<textarea>` is plain HTML.

### Newline handling

`<textarea>` captures `Enter` key presses. Decide upfront whether the value is truly multi-line or single-line-but-long:

| Value type                                                          | Pattern                                                         |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| Truly multi-line (e.g. body copy, bullet lists)                     | Allow newlines — no extra handling needed                       |
| Single-line-but-long (e.g. a description that renders in one block) | Strip newlines with `sanitizeSingleLineText` (see helper below) |

---

## Patterns

### Shared textarea style

Define this once above the `Settings` function and reuse it for every textarea in the file.

```js
const textareaStyle = {
  width: "100%",
  resize: "vertical",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  border: "1px solid #999",
  color: "#595959",
  padding: "7px 10px",
  fontSize: "14px",
  fontFamily: "Poppins, Open Sans, sans-serif",
  fontWeight: 300,
};
```

### Truly multi-line textarea

```jsx
<SettingItem>
  <Label content="Body copy" />
  <textarea
    value={state.bodyCopy}
    rows={5}
    onChange={(e) => setState({ ...state, bodyCopy: e.currentTarget.value })}
    style={textareaStyle}
  />
</SettingItem>
```

### Single-line-but-long textarea (strip newlines)

Use `sanitizeSingleLineText` to prevent editors from accidentally inserting line breaks into a value that renders as a single line.

```js
// Add this helper near the top of editor.js, outside any component
function sanitizeSingleLineText(value) {
  return String(value || "").replace(/[\r\n]+/g, " ");
}
```

```jsx
<SettingItem>
  <Label content="Description" />
  <textarea
    value={state.description}
    rows={3}
    onChange={(e) =>
      setState({
        ...state,
        description: sanitizeSingleLineText(e.currentTarget.value),
      })
    }
    style={textareaStyle}
  />
</SettingItem>
```

### Textarea with a placeholder

```jsx
<SettingItem>
  <Label content="Custom CSS" />
  <textarea
    value={state.customCss}
    rows={6}
    placeholder="/* add styles here */"
    onChange={(e) => setState({ ...state, customCss: e.currentTarget.value })}
    style={textareaStyle}
  />
</SettingItem>
```

### Textarea with explanation — use Label with help

```jsx
<SettingItem>
  <Label
    content="Embed code"
    help="Paste the full embed snippet here. It will be rendered inside an iframe."
  />
  <textarea
    value={state.embedCode}
    rows={5}
    onChange={(e) => setState({ ...state, embedCode: e.currentTarget.value })}
    style={textareaStyle}
  />
</SettingItem>
```

### Inside a Drawer (list item editing)

When editing list items, `updateItem` replaces `setState`. The pattern is identical.

```jsx
<SettingItem>
  <Label content="Item description" />
  <textarea
    value={selectedItem.description}
    rows={4}
    onChange={(e) =>
      updateItem(selectedItem.id, {
        description: sanitizeSingleLineText(e.currentTarget.value),
      })
    }
    style={textareaStyle}
  />
</SettingItem>
```

---

## Quick reference

| Situation                         | Use                                       |
| --------------------------------- | ----------------------------------------- |
| Short value (name, title, URL)    | `TextInput` from `@ui`                    |
| Long value, truly multi-line      | `<textarea>` — allow newlines             |
| Long value, single-line semantics | `<textarea>` + `sanitizeSingleLineText`   |
| Fixed-height, no resize           | Never — always allow `resize: 'vertical'` |
