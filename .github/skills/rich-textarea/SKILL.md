---
name: rich-textarea
description: "Full implementation of the RichTextEditor component for Dot.vu editor.js — contentEditable with floating bold/link/action toolbar, cursor-in-link detection, remove-bold/remove-link, Markdown source toggle, dismissible hint banner, and inline ActionSet list. Use whenever a component answer or body field needs rich text with Dot.vu action links."
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

| Ref             | Purpose                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `wrapperRef`    | Measures position for toolbar placement                                                       |
| `editorRef`     | The contentEditable div — always mounted, hidden with `display:none` in source mode           |
| `savedRangeRef` | Persists the selection range across React re-renders                                          |
| `toolbarRef`    | Used in blur handler to keep toolbar open when focus moves inside it                          |
| `prevValueRef`  | Tracks the last value written by `handleInput` to avoid resetting `innerHTML` on self-updates |

---

## State

```js
const [showToolbar, setShowToolbar]; // floating toolbar visibility
const [toolbarPos, setToolbarPos]; // { top, left } relative to wrapperRef
const [showLinkForm, setShowLinkForm]; // URL input popup
const [linkUrl, setLinkUrl]; // controlled value of URL input
const [isBold, setIsBold]; // true when cursor/selection is inside bold
const [isInLink, setIsInLink]; // true when cursor/selection is inside any <a>
const [showBanner, setShowBanner]; // dismissible hint banner
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

### Toolbar — cursor-in-link detection

`checkSelection` runs on every `keyUp` and `mouseUp`. For collapsed selections (cursor only), it checks if the cursor is inside an `<a>` by walking ancestors. If so, the toolbar is shown above the link element even without a text selection.

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

Always include both the class selector (primary) and the attribute selector fallback (for links saved before class names were introduced):

```css
.your-component-answer a.rte-link,
.your-component-answer a[href]:not([data-action-id]) {
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.your-component-answer a.rte-link:hover,
.your-component-answer a[href]:not([data-action-id]):hover {
  opacity: 0.75;
}
.your-component-answer a.rte-action-link,
.your-component-answer a[data-action-id] {
  color: #f57b37;
  text-decoration: underline;
  cursor: pointer;
  font-style: italic;
}
.your-component-answer a.rte-action-link:hover,
.your-component-answer a[data-action-id]:hover {
  opacity: 0.75;
}
```

Replace `.your-component-answer` with the class on the `dangerouslySetInnerHTML` element in your component (e.g. `.faq-answer`, `.card-body`, `.item-description`).

---

## Toolbar button layout

| Button                 | Condition   | Action                                                     |
| ---------------------- | ----------- | ---------------------------------------------------------- |
| **B** (bold)           | always      | `execCommand('bold')` toggle; lit background when `isBold` |
| Chain-link icon        | `!isInLink` | Opens URL input popup                                      |
| Wand icon              | `!isInLink` | Inserts action link immediately                            |
| Broken-link icon (red) | `isInLink`  | Unwraps `<a>`, removes link                                |

---

## Source toggle button

- In rich-text mode: small `</>` button, transparent background.
- In source mode: orange (`#f57b37`) background, bold white **"Save changes"** label.
- Toggling source → rich-text runs `markdownToHtml(markdownDraft)` and writes it to `onChange` + `editorRef.current.innerHTML`.

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
