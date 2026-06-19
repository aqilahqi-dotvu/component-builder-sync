---
name: rich-textarea
description: "Full implementation of the RichTextEditor component for Dot.vu editor.js — contentEditable with a permanent toolbar (bold, italic, subscript, URL link, action link, remove link), cursor-in-link detection, Markdown source toggle, and inline ActionSet list. Individual buttons are optional — components implement only the subset they need. Use whenever a component answer or body field needs rich text formatting."
---

# RichTextEditor — Full Pattern

Use this component whenever an editor field needs inline bold, URL links, and Dot.vu action links — not just plain `<textarea>` or `TextInput`.

---

## When to use

- An item has a `answer`, `body`, or `description` field that should support formatting.
- The field needs clickable Dot.vu action links (wired to `ActionSet`).
- The field needs a raw Markdown escape hatch for power users.

---

## Required state shape (per item in `common.js`)

Each item that uses `RichTextEditor` must include:

```js
{
  id: 'item1',
  answer: '',          // HTML string — stores <strong>, <a href>, <a data-action-id>
  linkActions: [],     // [{ id: string, actionSet: [] }]
}
```

Default `linkActions` to `[]` in `getInitialState`. Never omit it — runtime code iterates it unconditionally.

---

## Helper functions (top of `editor.js`, before the component)

### `htmlToMarkdown(html)`

Converts stored HTML to a user-editable Markdown string for the source view. Only converts `<strong>`/`<b>` → `**text**`, URL `<a>` → `[text](url)`, `<br>` → `\n`. Action links (`data-action-id`) become plain text with a warning shown to the user.

```js
function htmlToMarkdown(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";

  function walk(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return "";
    const tag = node.tagName.toLowerCase();
    const inner = Array.from(node.childNodes).map(walk).join("");
    if (tag === "strong" || tag === "b") return `**${inner}**`;
    if (tag === "em" || tag === "i") return `_${inner}_`;
    if (tag === "sub") return `~${inner}~`;
    if (tag === "sup") return `^${inner}^`;
    if (tag === "br") return "\n";
    if (tag === "a") {
      if (node.hasAttribute("data-action-id")) return inner;
      const href = node.getAttribute("href") || "";
      return `[${inner}](${href})`;
    }
    return inner;
  }

  return Array.from(div.childNodes).map(walk).join("");
}
```

### `markdownToHtml(md)`

Converts Markdown back to HTML on "Save changes". Only handles `**bold**` and `[text](https://...)`. URL must start with `https?://` to prevent XSS.

```js
function markdownToHtml(md) {
  let html = (md || "")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\_(.+?)\_/g, "<em>$1</em>")
    .replace(/~(.+?)~/g, "<sub>$1</sub>")
    .replace(/\^(.+?)\^/g, "<sup>$1</sup>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
  html = html.replace(/\n/g, "<br>");
  return html;
}
```

### `getActionLinkText(html, linkId)`

Returns a human-readable label for an action link based on the text content of its `<a data-action-id>` anchor.

```js
function getActionLinkText(html, linkId) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  const anchor = div.querySelector(`[data-action-id="${linkId}"]`);
  return anchor ? `"${anchor.textContent}"` : "Action Link";
}
```

---

## Component signature

```js
function RichTextEditor({
  value,              // HTML string (current answer)
  onChange,           // (html: string) => void
  onAddActionLink,    // (linkId: string) => void
  linkActions,        // [{ id, actionSet }]
  onRemoveActionLink, // (linkId: string) => void
  onUpdateActionLink, // (linkId: string, actionSet: []) => void
}) { ... }
```

---

## Refs

| Ref               | Purpose                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `editorRef`       | The contentEditable div — always mounted, hidden with `display:none` in source mode                      |
| `savedRangeRef`   | Persists the selection range across React re-renders (needed before `createLink` for URL links)          |
| `prevValueRef`    | Tracks the last value written by `handleInput` to avoid resetting `innerHTML` on self-updates            |
| `originalHtmlRef` | Stores the full HTML when entering source mode so action links can be restored if the draft is unchanged |

---

## State

```js
const [showLinkForm, setShowLinkForm]; // URL input dropdown below toolbar
const [linkUrl, setLinkUrl]; // controlled value of URL input
const [isBold, setIsBold]; // true when cursor/selection is inside bold
const [isItalic, setIsItalic]; // true when cursor/selection is inside italic
const [isSubscript, setIsSubscript]; // true when cursor/selection is inside subscript (include only when toolbar has a subscript button)
const [isSuperscript, setIsSuperscript]; // true when cursor/selection is inside superscript (include only when toolbar has a superscript button)
const [isInLink, setIsInLink]; // true when cursor/selection is inside any <a>
const [showSource, setShowSource]; // Markdown source mode toggle
const [markdownDraft, setMarkdownDraft]; // textarea value in source mode
```

---

## Key implementation rules

### DOM sync — avoid cursor-jump bug

The contentEditable div is **always mounted** (`display: none` in source mode, never conditionally rendered). This keeps `editorRef.current` valid across source toggles.

A `prevValueRef` stamps the last HTML written by `handleInput`. The sync `useEffect` skips `innerHTML` updates when `value === prevValueRef.current` (i.e. the update originated from the user typing). It only resets `innerHTML` for genuine external updates (e.g. after `removeActionLink`).

```js
const handleInput = () => {
  const html = editorRef.current.innerHTML;
  prevValueRef.current = html; // mark as self-update
  onChange(html);
};

React.useEffect(() => {
  if (editorRef.current && value !== prevValueRef.current) {
    editorRef.current.innerHTML = value || "";
  }
  prevValueRef.current = value;
}, [value]);
```

### Toolbar — permanent bar, cursor state detection

The toolbar is **always rendered** above the editor. It is never shown or hidden based on selection state. Disable buttons (e.g. `opacity: 0.4; pointer-events: none`) when source mode is active — `execCommand` has no effect on a `<textarea>`.

`checkSelection` runs on every `keyUp` and `mouseUp`. It updates `isBold`, `isItalic`, `isSubscript`, and `isInLink` to reflect the cursor position, which drives button highlight states and switches between the link/remove-link icons. For collapsed selections (cursor only), it walks ancestors to detect if the cursor is inside an `<a>`.

```js
const findLinkAncestor = (node) => {
  let current = node;
  while (current && current !== editorRef.current) {
    if (current.nodeType === 1 && current.tagName.toLowerCase() === "a")
      return current;
    current = current.parentNode;
  }
  return null;
};
```

Always check **both** `sel.anchorNode` and `sel.focusNode` — when the whole link word is drag-selected the anchor may land outside the `<a>`:

```js
const linkEl =
  findLinkAncestor(sel.anchorNode) || findLinkAncestor(sel.focusNode);
```

### Remove link — DOM unwrap instead of `execCommand('unlink')`

`execCommand('unlink')` requires the entire link to be selected. Instead, unwrap the `<a>` directly:

```js
const handleRemoveLink = () => {
  const sel = window.getSelection();
  const linkEl =
    (sel && findLinkAncestor(sel.anchorNode)) ||
    (sel && findLinkAncestor(sel.focusNode)) ||
    (savedRangeRef.current &&
      findLinkAncestor(savedRangeRef.current.startContainer));
  if (linkEl && linkEl.parentNode) {
    const parent = linkEl.parentNode;
    while (linkEl.firstChild) parent.insertBefore(linkEl.firstChild, linkEl);
    parent.removeChild(linkEl);
    handleInput();
  }
  setIsInLink(false);
  setShowToolbar(false);
  setShowLinkForm(false);
};
```

### URL normalisation

Always prepend `https://` if the user omits the protocol:

```js
let url = linkUrl.trim();
if (!/^https?:\/\//i.test(url)) {
  url = `https://${url.replace(/^\/\//, "")}`;
}
```

### Link popup — prevent editor blur without breaking radio/input focus

Put `onMouseDown={(e) => e.preventDefault()}` on the **popup container div**, not on individual child elements. Then add `onMouseDown={(e) => e.stopPropagation()}` on any native `<input>` inside the popup so it can still receive focus. Add `autoFocus` to open the URL input ready to type.

### Stale-state race in `Settings`

`insertActionLink` calls both `onAddActionLink` and `handleInput` → `onChange` → `updateEditingItem` synchronously. Both paths call `setState`. Use **functional `setState(prev => ...)`** for all item mutation helpers so updates chain rather than clobber each other:

```js
const updateEditingItem = (prop, val) => {
  setState((prev) => ({
    ...prev,
    items: prev.items.map((item) =>
      item.id === editingId ? { ...item, [prop]: val } : item,
    ),
  }));
};

const handleAddActionLink = (linkId) => {
  setState((prev) => ({
    ...prev,
    items: prev.items.map((item) =>
      item.id === editingId
        ? {
            ...item,
            linkActions: [
              ...(item.linkActions || []),
              { id: linkId, actionSet: [] },
            ],
          }
        : item,
    ),
  }));
};
```

The same applies to `updateActionLink` and `removeActionLink`.

### Remove action link

Strip the `<a data-action-id>` from the HTML and remove the entry from `linkActions` atomically:

```js
const removeActionLink = (linkId) => {
  setState((prev) => {
    const item = prev.items.find((i) => i.id === editingId);
    if (!item) return prev;
    const div = document.createElement("div");
    div.innerHTML = item.answer || "";
    const anchor = div.querySelector(`[data-action-id="${linkId}"]`);
    if (anchor) {
      const parent = anchor.parentNode;
      while (anchor.firstChild) parent.insertBefore(anchor.firstChild, anchor);
      parent.removeChild(anchor);
    }
    const newAnswer = div.innerHTML;
    return {
      ...prev,
      items: prev.items.map((i) =>
        i.id === editingId
          ? {
              ...i,
              answer: newAnswer,
              linkActions: (i.linkActions || []).filter((l) => l.id !== linkId),
            }
          : i,
      ),
    };
  });
};
```

---

## Link class names

Both link types are stamped with a class name at insertion time so components can target them in `ScopedStyle` without relying on attribute selectors alone.

| Class             | Applied to                                   | Purpose                                              |
| ----------------- | -------------------------------------------- | ---------------------------------------------------- |
| `rte-link`        | `<a href class="rte-link">`                  | URL links inserted via the chain-link toolbar button |
| `rte-action-link` | `<a data-action-id class="rte-action-link">` | Action links inserted via the wand toolbar button    |

### `insertUrlLink` — stamp `rte-link`

```js
editorRef.current
  .querySelectorAll("a[href]:not([data-action-id])")
  .forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "rte-link";
  });
```

### `insertActionLink` — stamp `rte-action-link` + inline preview styles

Action links get inline styles so they look styled immediately inside the contentEditable editor (where `ScopedStyle` doesn't apply). The class is the canonical target for live styles.

```js
const anchor = document.createElement("a");
anchor.setAttribute("data-action-id", id);
anchor.className = "rte-action-link";
anchor.style.textDecoration = "underline";
anchor.style.cursor = "pointer";
anchor.style.color = "#f57b37";
anchor.textContent = selectedText;
```

### Live `ScopedStyle` pattern

**Rule:** Always prefix `rte-link` and `rte-action-link` with the component's own unique element class. Never use bare `.rte-link` or `.rte-action-link` — `ScopedStyle` is scoped to the component instance, but the class names themselves are shared across all components that use `RichTextEditor`. Without a component-specific prefix, styles from one component could bleed into another if both are on the same page.

The prefix should be the class already applied to the `dangerouslySetInnerHTML` container element (e.g. `className="faq-answer"`):

```css
/* ✅ Correct — scoped with component prefix */
.faq-answer a.rte-link { ... }
.faq-answer a.rte-action-link { ... }

/* ❌ Wrong — unscoped, may leak across components */
a.rte-link { ... }
.rte-action-link { ... }
```

Always include both the class selector (primary) and the attribute selector fallback (for links saved before class names were introduced).

If the component exposes link style settings in state (color, underline, bold, italic), drive the CSS from those values using a template literal. Default to safe fallbacks (`inherit`, `underline`) so existing links still render correctly when state fields are absent:

```jsx
<ScopedStyle>{`
  .your-component-answer a.rte-link,
  .your-component-answer a[href]:not([data-action-id]) {
    color: ${state.urlLinkColor || "inherit"};
    text-decoration: ${state.urlLinkUnderline !== false ? "underline" : "none"};
    font-weight: ${state.urlLinkBold ? "bold" : "inherit"};
    font-style: ${state.urlLinkItalic ? "italic" : "inherit"};
    cursor: pointer;
  }
  .your-component-answer a.rte-link:hover,
  .your-component-answer a[href]:not([data-action-id]):hover {
    opacity: 0.75;
  }
  .your-component-answer a.rte-action-link,
  .your-component-answer a[data-action-id] {
    color: ${state.actionLinkColor || "#f57b37"};
    text-decoration: ${state.actionLinkUnderline !== false ? "underline" : "none"};
    font-weight: ${state.actionLinkBold ? "bold" : "inherit"};
    font-style: ${state.actionLinkItalic !== false ? "italic" : "inherit"};
    cursor: pointer;
  }
  .your-component-answer a.rte-action-link:hover,
  .your-component-answer a[data-action-id]:hover {
    opacity: 0.75;
  }
`}</ScopedStyle>
```

For the matching editor settings, add these defaults to `common.js`:

```js
urlLinkColor: 'inherit',
urlLinkUnderline: true,
urlLinkBold: false,
urlLinkItalic: false,
actionLinkColor: '#f57b37',
actionLinkUnderline: true,
actionLinkBold: false,
actionLinkItalic: true,
```

And expose them in `editor.js` under a **Styles** tab using `ColorPicker` + `Checkbox` controls (see `settings-checkbox` and `settings-dropdown` skills). The `urlLinkColor` field stores `'inherit'` as a sentinel — pass `state.answerColor` to the `ColorPicker` as its display value when the stored value is `'inherit'`, but write `'inherit'` into the CSS.

Replace `.your-component-answer` with the class on the `dangerouslySetInnerHTML` element in your component (e.g. `.faq-answer`, `.card-body`, `.item-description`).

---

## Toolbar button layout

| Button                 | Condition                       | Action                                                                      |
| ---------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| **B** (bold)           | always                          | `execCommand('bold')` toggle; orange background when `isBold`               |
| _I_ (italic)           | always                          | `execCommand('italic')` toggle; orange background when `isItalic`           |
| X₂ (subscript)         | always (optional per component) | `execCommand('subscript')` toggle; orange background when `isSubscript`     |
| X² (superscript)       | always (optional per component) | `execCommand('superscript')` toggle; orange background when `isSuperscript` |
| Chain-link icon        | `!isInLink`                     | Opens URL input dropdown below the toolbar                                  |
| Wand icon              | `!isInLink`                     | Inserts action link immediately                                             |
| Broken-link icon (red) | `isInLink`                      | Unwraps `<a>`, removes link                                                 |

### Canonical toolbar icons

Use these exact inline SVGs. Render them at 14×14 px and use `fill="currentColor"` so they inherit the button's text color. These are Material Symbols icons (`viewBox="0 -960 960 960"`).

**Link icon**

```jsx
const IconLink = () => (
  <svg
    fill="currentColor"
    height="14"
    viewBox="0 -960 960 960"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M328-160q-69.69 0-118.85-49.15Q160-258.31 160-328q0-33.85 12.31-64.46 12.31-30.62 36.46-54.77l120.92-119.92 28.31 28.3-120.92 120.16q-18.54 18.54-28.2 41.96-9.65 23.42-9.65 48.73 0 53.62 37.58 90.81Q274.38-200 328-200q25.31 0 48.85-9.65 23.53-9.66 42.07-28.2L539.62-358l28.53 28.54-120.92 119.92q-24.15 24.16-54.77 36.85Q361.85-160 328-160Zm73.62-213.85-27.77-28.53 184.53-184.54 28.54 28.54-185.3 184.53Zm228.69-18.77L602-420.38l120.92-120.7q17.77-17.77 27.31-40.69 9.54-22.92 9.54-48.23 0-53.85-37.46-91.92Q684.85-760 631-760q-25.31 0-48.73 9.65-23.42 9.66-41.19 27.43L420.38-602l-27.76-28.31 120.15-120.15q24.15-24.16 54.77-36.85Q598.15-800 632-800q69.69 0 118.73 49.54 49.04 49.54 49.04 119.46 0 33.62-12.19 63.85-12.2 30.23-36.35 54.38L630.31-392.62Z" />
  </svg>
);
```

**Action link (wand icon)**

```jsx
const IconWand = () => (
  <svg
    fill="currentColor"
    height="14"
    viewBox="0 -960 960 960"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m346.38-664.08-91.53-91.54 28.53-28.53 91.54 91.53-28.54 28.54ZM500-750.62v-130h40v130h-40Zm255.62 495.77-91.54-91.53 28.54-28.54 91.53 91.54-28.53 28.53ZM708-679.46 679.46-708 771-799.54 799.54-771 708-679.46ZM750.62-500v-40h130v40h-130ZM206.54-139.69l-67.62-67.62q-9.69-9.69-9.69-22.61 0-12.93 9.69-22.62l340.7-340.92q23.23-23.46 56.42-23.46t56.65 23.28q23.46 23.28 23.46 56.54 0 33.25-23.46 56.72L251.77-139.69q-9.69 9.69-22.62 9.69-12.92 0-22.61-9.69Zm273.61-284.23-14.5-14-14.5-14-14-14-14-14 28 28 29 28Zm-251 251 251-251-57-56-250 250 56 57Z" />
  </svg>
);
```

**Remove link icon**

A single SVG at 14×14. The button gets red (`#dc2626`) color when `isInLink`.

```jsx
const IconUnlink = () => (
  <svg
    fill="currentColor"
    height="14"
    viewBox="0 -960 960 960"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M740.77-329.69 710-360.92q40.77-11 65.38-44.04Q800-438 800-480q0-50.77-35.77-86.92-35.77-36.16-85.77-36.16H533.85v-40h144.61q66.85 0 114.19 47.73Q840-547.62 840-480q0 49.31-27.58 89.23-27.57 39.92-71.65 61.08ZM612.46-460l-40-40h46v40h-6ZM819.69-83.69l-736-736L112-848l736 736-28.31 28.31ZM426.15-316.92H283.08q-67.62 0-115.35-47.73Q120-412.38 120-480q0-64.38 43.92-111.08 43.93-46.69 107.62-50.61H290l38.62 38.61h-45.54q-50.77 0-86.93 36.16Q160-530.77 160-480t36.15 86.92q36.16 36.16 86.93 36.16h143.07v40ZM341.54-460v-40h90.38l39 40H341.54Z" />
  </svg>
);
```

---

## Canonical inline styles

Use these exact inline style values for the wrapper, toolbar, buttons, and content area. They are derived from the platform design system and match the editor UI.

```jsx
{
  /* Outer wrapper */
}
<div
  style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden" }}
>
  {/* Toolbar */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      padding: "4px 6px",
      background: "#f9fafb",
      borderBottom: "1px solid #d1d5db",
    }}
    onMouseDown={(e) => e.preventDefault()}
  >
    {/* B / I buttons — fontSize: 13 */}
    <button
      style={{
        background: isActive ? "#f57b37" : "transparent",
        border: "none",
        borderRadius: 4,
        color: isActive ? "#fff" : "#374151",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: "bold",
        lineHeight: "18px",
        padding: "3px 8px",
      }}
      type="button"
    >
      B
    </button>

    {/* X₂ / X² buttons — fontSize: 11 (smaller to fit sub/superscript label) */}
    <button
      style={{
        background: isActive ? "#f57b37" : "transparent",
        border: "none",
        borderRadius: 4,
        color: isActive ? "#fff" : "#374151",
        cursor: "pointer",
        fontSize: 11,
        lineHeight: "18px",
        padding: "3px 8px",
      }}
      type="button"
    >
      X<sub>2</sub>
    </button>

    {/* Icon buttons (link, wand, unlink) — use padding: '3px 6px' */}
    <button
      style={{
        background: "transparent",
        border: "none",
        borderRadius: 4,
        color:
          "#374151" /* red (#dc2626) when isInLink for the unlink button */,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        lineHeight: "18px",
        padding: "3px 6px",
      }}
      type="button"
    >
      <IconLink />
    </button>
  </div>

  {/* ContentEditable area */}
  <div
    contentEditable
    suppressContentEditableWarning
    ref={editorRef}
    style={{
      boxSizing: "border-box",
      fontSize: 13,
      lineHeight: 1.5,
      minHeight: 80,
      outline: "none",
      padding: "8px 10px",
      width: "100%",
    }}
    onInput={handleInput}
    onKeyUp={checkSelection}
    onMouseUp={checkSelection}
  />

  {/* ✅ ActionSet list — configure Dot.vu actions for links in the text */}
  {!showSource && linkActions && linkActions.length > 0 && (
    <div
      style={{
        borderTop: "1px solid #d1d5db",
        background: "#f9fafb",
        padding: "10px 10px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: 8,
          color: "#6b7280",
          letterSpacing: "0.05em",
        }}
      >
        Action Links
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {linkActions.map((link) => (
          <div key={link.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                {getActionLinkText(value, link.id)}
              </span>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: 4,
                  color: "#dc2626",
                  cursor: "pointer",
                  fontSize: 11,
                  padding: "2px 4px",
                }}
                type="button"
                onClick={() => onRemoveActionLink(link.id)}
              >
                Remove
              </button>
            </div>
            <ActionSet
              value={link.actionSet || []}
              onChange={(actionSet) => onUpdateActionLink(link.id, actionSet)}
            />
          </div>
        ))}
      </div>
    </div>
  )}
</div>;
```

### Style reference table

| Element                           | Key values                                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrapper                           | `border: '1px solid #d1d5db'`, `borderRadius: 6`, `overflow: 'hidden'`                                                                                                       |
| Toolbar                           | `background: '#f9fafb'`, `borderBottom: '1px solid #d1d5db'`, `padding: '4px 6px'`, `gap: 2`                                                                                 |
| B / I button (inactive)           | `background: 'transparent'`, `color: '#374151'`, `fontSize: 13`, `padding: '3px 8px'`                                                                                        |
| B / I button (active)             | `background: '#f57b37'`, `color: '#fff'`                                                                                                                                     |
| X₂ / X² button                    | same as B/I but `fontSize: 11`                                                                                                                                               |
| Icon buttons (link, wand, unlink) | same inactive/active as B/I, `padding: '3px 6px'`, `display: 'flex'`, `alignItems: 'center'`; unlink button uses `color: '#dc2626'` (instead of `'#374151'`) when `isInLink` |
| ContentEditable                   | `fontSize: 13`, `lineHeight: 1.5`, `minHeight: 80`, `padding: '8px 10px'`, `outline: 'none'`, `width: '100%'`, `boxSizing: 'border-box'`                                     |
| Action Links Section              | `borderTop: '1px solid #d1d5db'`, `background: '#f9fafb'`, `padding: '10px 10px'`, `display: 'flex'`, `flexDirection: 'column'`, `gap: 12`                                   |

---

## Source toggle button

- In rich-text mode: small `</>` button, transparent background.
- In source mode: orange (`#f57b37`) background, bold white **"Save changes"** label.
- On **enter** source mode: save the current HTML to `originalHtmlRef.current`, then convert to Markdown for the draft textarea.
- On **exit** source mode: compare the draft to `htmlToMarkdown(originalHtmlRef.current)`. If they are identical (user didn't change anything), restore the original HTML directly — this preserves action links which cannot survive a Markdown round-trip. If the draft was edited, run `markdownToHtml(markdownDraft)` as usual.

```js
const handleToggleSource = () => {
  if (!showSource) {
    originalHtmlRef.current = value;
    setMarkdownDraft(htmlToMarkdown(value));
    setShowSource(true);
    setShowToolbar(false);
    setShowLinkForm(false);
  } else {
    const unchanged = markdownDraft === htmlToMarkdown(originalHtmlRef.current);
    const newHtml = unchanged
      ? originalHtmlRef.current
      : markdownToHtml(markdownDraft);
    onChange(newHtml);
    if (editorRef.current) editorRef.current.innerHTML = newHtml;
    setShowSource(false);
  }
};
```

---

## Call site in `DrawerSection`

```jsx
<RichTextEditor
  key={editingId}
  linkActions={editingItem.linkActions || []}
  value={editingItem.answer}
  onAddActionLink={handleAddActionLink}
  onChange={(html) => updateEditingItem("answer", html)}
  onRemoveActionLink={removeActionLink}
  onUpdateActionLink={updateActionLink}
/>
```

`key={editingId}` ensures the component remounts (and re-initialises `editorRef`) when switching between items.

---

## Pitfalls checklist

- **Never** conditionally render the contentEditable div — always use `display: none` to hide it.
- **Never** use `execCommand('unlink')` — it requires full link selection. Use DOM unwrap.
- **Never** use `setState({ ...state, ... })` in item mutators — always use `setState(prev => ...)`.
- **Never** use `Node.TEXT_NODE` or `Node.ELEMENT_NODE` — use the numeric literals `3` and `1` (the `Node` global is not available in the linting environment).
- **Always** check both `anchorNode` and `focusNode` when detecting link ancestry.
- **Always** normalise URLs to `https://` before calling `createLink`.
- **Always** set `prevValueRef.current = html` in `handleInput` before calling `onChange`.
- **Always** use both the class selector and the attribute selector fallback in `ScopedStyle` so links saved before class names were added still render correctly.
- **Always** prefix `rte-link` and `rte-action-link` with the component's own container class (e.g. `.faq-answer a.rte-link`) — never use bare `.rte-link` or `.rte-action-link` as they are shared names.
- **Always** store `originalHtmlRef.current = value` when entering source mode. On exit, compare the draft to `htmlToMarkdown(originalHtmlRef.current)` — if unchanged, restore the original HTML. Action links (`data-action-id`) cannot survive a Markdown round-trip; without this guard, toggling source mode and back silently destroys them.
- **Never** use hardcoded CSS values in `ScopedStyle` for link colors/decoration when state fields exist — drive them from state so editor settings take effect immediately.
- **Never** conditionally render the toolbar — it must always be visible above the editor. Control button appearance (highlighted state, disabled) instead of hiding the whole bar.
- **Always** put `onMouseDown={e => e.preventDefault()}` on the toolbar container div. Without it, clicking a toolbar button blurs the contentEditable and clears the selection before `execCommand` runs, so bold/italic/link have no effect.
- **Always** render a list of `ActionSet` items inside the component below the editor to configure any `linkActions` detected in the text.
- Italic (`execCommand('italic')`) does not require DOM unwrapping — toggling it again removes the `<em>`. No special removal handler is needed, unlike links.
