---
name: rich-textarea
description: "Full implementation of the RichTextEditor component for Dot.vu editor.js — contentEditable with a permanent toolbar (bold, italic, action link via wand icon, remove link), cursor-in-link detection, Markdown source toggle, and inline ActionSet list. URL links are intentionally omitted — use ActionSet with 'Go to external URL' instead. Individual buttons are optional — components implement only the subset they need. Use whenever a component answer or body field needs rich text formatting."
---

# RichTextEditor — Full Pattern

Use this component whenever an editor field needs inline bold, italic, and Dot.vu action links — not just plain `<textarea>` or `TextInput`.

**No URL link button.** URL navigation is handled by configuring an ActionSet action link with the "Go to external URL" action type. Do not add a chain-link/URL insertion button.

---

## When to use

- An item has an `answer`, `body`, or `description` field that should support formatting.
- The field needs clickable Dot.vu action links (wired to `ActionSet`).
- The field needs a raw Markdown escape hatch for power users.

---

## Required state shape (per item in `common.js`)

Each item that uses `RichTextEditor` must include:

```js
{
  id: 'item1',
  answer: '',          // HTML string — stores <strong>, <em>, <a data-action-id>
  linkActions: [],     // [{ id: string, actionSet: [] }]
}
```

Default `linkActions` to `[]` in `getInitialState`. Never omit it — runtime code iterates it unconditionally.

---

## Helper functions (top of `editor.js`, before the component)

### `htmlToMarkdown(html)`

Converts stored HTML to a user-editable Markdown string for the source view. Converts `<strong>`/`<b>` → `**text**`, `<em>`/`<i>` → `_text_`, `<br>` → `\n`. Action links (`data-action-id`) become plain text.

```js
function htmlToMarkdown(html) {
  const div = document.createElement('div')
  div.innerHTML = html || ''

  function walk(node) {
    if (node.nodeType === 3) return node.textContent
    if (node.nodeType !== 1) return ''
    const tag = node.tagName.toLowerCase()
    const inner = Array.from(node.childNodes).map(walk).join('')
    if (tag === 'strong' || tag === 'b') return `**${inner}**`
    if (tag === 'em' || tag === 'i') return `_${inner}_`
    if (tag === 'br') return '\n'
    return inner
  }

  return Array.from(div.childNodes).map(walk).join('')
}
```

### `markdownToHtml(md)`

Converts Markdown back to HTML on source exit. Only handles `**bold**`, `_italic_`, and `\n` → `<br>`.

```js
function markdownToHtml(md) {
  let html = (md || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
  html = html.replace(/\n/g, '<br>')
  return html
}
```

---

## Component signature

```js
function RichTextEditor({
  value,              // HTML string (current field value)
  onChange,           // (html: string) => void
  placeholder,        // string
  onAddActionLink,    // (linkId: string) => void
  linkActions,        // [{ id, actionSet }]
  onRemoveActionLink, // (linkId: string) => void
  onUpdateActionLink, // (linkId: string, actionSet: []) => void
}) { ... }
```

---

## Refs

| Ref             | Purpose                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `editorRef`     | The contentEditable div — always mounted, hidden with `display:none` in source mode             |
| `savedRangeRef` | Persists the selection range across React re-renders (needed before action link insertion)      |
| `prevValueRef`  | Tracks the last value written by `handleInput` to avoid resetting `innerHTML` on self-updates   |

---

## State

```js
const [isBold, setIsBold]         // true when cursor/selection is inside bold
const [isItalic, setIsItalic]     // true when cursor/selection is inside italic
const [isInLink, setIsInLink]     // true when cursor/selection is inside any <a>
const [showSource, setShowSource] // Markdown source mode toggle
const [markdownDraft, setMarkdownDraft] // textarea value in source mode
```

---

## Key implementation rules

### DOM sync — avoid cursor-jump bug

The contentEditable div is **always mounted** (`display: none` in source mode, never conditionally rendered). This keeps `editorRef.current` valid across source toggles.

A `prevValueRef` stamps the last HTML written by `handleInput`. The sync `useEffect` skips `innerHTML` updates when `value === prevValueRef.current` — it only resets `innerHTML` for genuine external updates (e.g. after `removeActionLink`). Initialise `prevValueRef.current` to `null` so the first render always loads the HTML.

```js
React.useEffect(() => {
  if (editorRef.current && value !== prevValueRef.current) {
    editorRef.current.innerHTML = value || ''
  }
  prevValueRef.current = value
}, [value])

const handleInput = () => {
  if (!editorRef.current) return

  // Normalize <b> → <strong> and <i> → <em>
  editorRef.current.querySelectorAll('b').forEach((b) => {
    const strong = document.createElement('strong')
    while (b.firstChild) strong.appendChild(b.firstChild)
    b.parentNode.replaceChild(strong, b)
  })
  editorRef.current.querySelectorAll('i').forEach((i) => {
    const em = document.createElement('em')
    while (i.firstChild) em.appendChild(i.firstChild)
    i.parentNode.replaceChild(em, i)
  })

  const html = editorRef.current.innerHTML
  prevValueRef.current = html
  onChange(html)
}
```

The normalization step ensures `execCommand('bold')` and `execCommand('italic')`, which may produce `<b>`/`<i>` in some browsers, always produce `<strong>`/`<em>` in saved HTML.

### Toolbar — permanent bar, cursor state detection

The toolbar is **always rendered** above the editor. Disable buttons when source mode is active.

`checkSelection` runs on every `keyUp` and `mouseUp`. It updates `isBold`, `isItalic`, and `isInLink` to reflect the cursor position.

```js
const findLinkAncestor = (node) => {
  let current = node
  while (current && current !== editorRef.current) {
    if (current.nodeType === 1 && current.tagName.toLowerCase() === 'a')
      return current
    current = current.parentNode
  }
  return null
}

const checkSelection = () => {
  setIsBold(document.queryCommandState('bold'))
  setIsItalic(document.queryCommandState('italic'))

  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) {
    setIsInLink(false)
    return
  }

  savedRangeRef.current = sel.getRangeAt(0)
  const linkEl = findLinkAncestor(sel.anchorNode) || findLinkAncestor(sel.focusNode)
  setIsInLink(!!linkEl)
}
```

Always check **both** `sel.anchorNode` and `sel.focusNode` — when the whole link word is drag-selected the anchor may land outside the `<a>`.

### Bold / Italic

Use `execCommand` with a `setTimeout(fn, 0)` wrapper if needed to maintain selection state after button click. The `handleInput` normalization corrects any `<b>`/`<i>` output automatically.

```js
const toggleBold = () => {
  editorRef.current?.focus()
  document.execCommand('bold', false)
  checkSelection()
  handleInput()
}
```

### Action links

The wand button wraps selected text in `<a data-action-id="...">`. Require a non-empty selection — if nothing is selected, do nothing. Stamp the class `rte-action-link` and inline preview styles so the link looks styled inside the contentEditable.

```js
const handleInsertActionLink = () => {
  if (!onAddActionLink) return
  const sel = window.getSelection()
  if (!sel || sel.toString().length === 0) return

  const linkId = getUniqueId()
  onAddActionLink(linkId)

  const selectedText = sel.toString()
  if (savedRangeRef.current) {
    sel.removeAllRanges()
    sel.addRange(savedRangeRef.current)
  }

  const anchor = document.createElement('a')
  anchor.setAttribute('data-action-id', linkId)
  anchor.className = 'rte-action-link'
  anchor.style.textDecoration = 'underline'
  anchor.style.cursor = 'pointer'
  anchor.style.color = '#f57b37'
  anchor.textContent = selectedText

  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0)
    range.deleteContents()
    range.insertNode(anchor)
    range.setEndAfter(anchor)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  handleInput()
  editorRef.current?.focus()
  checkSelection()
}
```

### Remove link — DOM unwrap instead of `execCommand('unlink')`

`execCommand('unlink')` requires the entire link to be selected. Instead, unwrap the `<a>` directly. Also call `onRemoveActionLink` to strip the entry from `linkActions`:

```js
const handleRemoveLink = () => {
  const sel = window.getSelection()
  const linkEl =
    (sel && findLinkAncestor(sel.anchorNode)) ||
    (sel && findLinkAncestor(sel.focusNode)) ||
    (savedRangeRef.current && findLinkAncestor(savedRangeRef.current.startContainer))

  if (linkEl && linkEl.parentNode) {
    const linkId = linkEl.getAttribute('data-action-id')
    if (linkId && onRemoveActionLink) onRemoveActionLink(linkId)
    const parent = linkEl.parentNode
    while (linkEl.firstChild) parent.insertBefore(linkEl.firstChild, linkEl)
    parent.removeChild(linkEl)
    handleInput()
  }

  setIsInLink(false)
  editorRef.current?.focus()
}
```

---

## Toolbar button layout

| Button            | Condition   | Icon                     | Action                                                            |
| ----------------- | ----------- | ------------------------ | ----------------------------------------------------------------- |
| **Bold** (B)      | always      | Material Bold            | `execCommand('bold')` toggle; orange background when `isBold`     |
| _Italic_ (I)      | always      | Material Italic          | `execCommand('italic')` toggle; orange background when `isItalic` |
| Wand (action)     | `!isInLink` | Material Wand (sparkles) | Wraps selected text in `<a data-action-id>`                       |
| Broken-link icon  | `isInLink`  | Material Unlink (red)    | Unwraps `<a>`, calls `onRemoveActionLink`                         |
| Markdown (source) | always      | Material Code chevrons   | Toggle between rich editor and Markdown source mode               |

### Canonical toolbar icons (Material Symbols, `viewBox="0 -960 960 960"`, 14×14, `fill="currentColor"`)

**Bold:**
```jsx
<svg fill="currentColor" height="14" viewBox="0 -960 960 960" width="14">
  <path d="M272-200v-560h221q65 0 120 40t55 111q0 51-23 78.5T602-491q25 11 55.5 41t30.5 90q0 89-65 124.5T501-200H272Zm121-112h104q48 0 58.5-24.5T566-372q0-11-10.5-35.5T494-432H393v120Zm0-228h93q33 0 48-17t15-38q0-24-17-39t-44-15h-95v109Z" />
</svg>
```

**Italic:**
```jsx
<svg fill="currentColor" height="14" viewBox="0 -960 960 960" width="14">
  <path d="M200-200v-100h160l120-360H320v-100h400v100H580L460-300h140v100H200Z" />
</svg>
```

**Action link (wand):**
```jsx
<svg fill="currentColor" height="14" viewBox="0 -960 960 960" width="14">
  <path d="m346.38-664.08-91.53-91.54 28.53-28.53 91.54 91.53-28.54 28.54ZM500-750.62v-130h40v130h-40Zm255.62 495.77-91.54-91.53 28.54-28.54 91.53 91.54-28.53 28.53ZM708-679.46 679.46-708 771-799.54 799.54-771 708-679.46ZM750.62-500v-40h130v40h-130ZM206.54-139.69l-67.62-67.62q-9.69-9.69-9.69-22.61 0-12.93 9.69-22.62l340.7-340.92q23.23-23.46 56.42-23.46t56.65 23.28q23.46 23.28 23.46 56.54 0 33.25-23.46 56.72L251.77-139.69q-9.69 9.69-22.62 9.69-12.92 0-22.61-9.69Zm273.61-284.23-14.5-14-14.5-14-14-14-14-14 28 28 29 28Zm-251 251 251-251-57-56-250 250 56 57Z" />
</svg>
```

**Remove link (red):**
```jsx
<svg fill="currentColor" height="14" viewBox="0 -960 960 960" width="14">
  <path d="M740.77-329.69 710-360.92q40.77-11 65.38-44.04Q800-438 800-480q0-50.77-35.77-86.92-35.77-36.16-85.77-36.16H533.85v-40h144.61q66.85 0 114.19 47.73Q840-547.62 840-480q0 49.31-27.58 89.23-27.57 39.92-71.65 61.08ZM612.46-460l-40-40h46v40h-6ZM819.69-83.69l-736-736L112-848l736 736-28.31 28.31ZM426.15-316.92H283.08q-67.62 0-115.35-47.73Q120-412.38 120-480q0-64.38 43.92-111.08 43.93-46.69 107.62-50.61H290l38.62 38.61h-45.54q-50.77 0-86.93 36.16Q160-530.77 160-480t36.15 86.92q36.16 36.16 86.93 36.16h143.07v40ZM341.54-460v-40h90.38l39 40H341.54Z" />
</svg>
```

**Markdown/code toggle:**
```jsx
<svg fill="currentColor" height="14" viewBox="0 -960 960 960" width="14">
  <path d="M240-280 40-480l200-200 56 56-143 144 143 144-56 56Zm178 132-76-24 200-640 76 24-200 640Zm302-132-56-56 143-144-143-144 56-56 200 200-200 200Z" />
</svg>
```

---

## ActionSet list (below the editor)

After the contentEditable area, render an `ActionSet` for each entry in `linkActions`. This is how users configure the action that fires when a wand-linked word is clicked.

```jsx
{!showSource && linkActions && linkActions.length > 0 && (
  <div style={{ borderTop: '1px solid #d1d5db', background: '#f9fafb', padding: '10px 12px' }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: '#6b7280', letterSpacing: '0.05em' }}>
      Action Links
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {linkActions.map((link) => (
        <div key={link.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 500, fontSize: 13 }}>{link.id}</span>
            <button
              style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 11, padding: '2px 4px' }}
              type="button"
              onClick={() => onRemoveActionLink && onRemoveActionLink(link.id)}
            >
              Remove
            </button>
          </div>
          <ActionSet
            value={link.actionSet || []}
            onChange={(actionSet) => onUpdateActionLink && onUpdateActionLink(link.id, actionSet)}
          />
        </div>
      ))}
    </div>
  </div>
)}
```

---

## Source toggle

```js
const toggleSource = () => {
  if (!showSource) {
    setMarkdownDraft(htmlToMarkdown(value))
    setShowSource(true)
  } else {
    const html = markdownToHtml(markdownDraft)
    onChange(html)
    setShowSource(false)
  }
}
```

**Note:** Action links (`data-action-id`) do not survive a Markdown round-trip. If you need to preserve them through source mode, store `originalHtmlRef.current = value` on enter and restore it on exit if the draft is unchanged.

---

## Live component CSS

In `live.js` `ScopedStyle`, always add explicit rules for `<strong>` and `<em>` inside the rendered HTML container — browser resets can strip these:

```css
.your-component-caption strong { font-weight: 800 !important; }
.your-component-caption em { font-style: italic !important; }
.your-component-caption a.rte-action-link,
.your-component-caption a[data-action-id] {
  color: #f57b37;
  text-decoration: underline;
  cursor: pointer;
}
```

Prefix with your component's container class — never use bare `.rte-action-link`.

---

## Call site in `Settings`

```jsx
<RichTextEditor
  linkActions={state.heroCaptionLinkActions || []}
  placeholder="Type caption..."
  value={state.heroCaptionHtml || ''}
  onAddActionLink={(linkId) => {
    updateState({
      heroCaptionLinkActions: [
        ...(state.heroCaptionLinkActions || []),
        { id: linkId, actionSet: [] }
      ]
    })
  }}
  onChange={heroCaptionHtml => updateState({ heroCaptionHtml })}
  onRemoveActionLink={(linkId) => {
    updateState({
      heroCaptionLinkActions: (state.heroCaptionLinkActions || []).filter(l => l.id !== linkId)
    })
  }}
  onUpdateActionLink={(linkId, actionSet) => {
    updateState({
      heroCaptionLinkActions: (state.heroCaptionLinkActions || []).map(l =>
        l.id === linkId ? { ...l, actionSet } : l
      )
    })
  }}
/>
```

---

## Pitfalls checklist

- **Never** add a URL/chain-link button — use ActionSet "Go to external URL" instead.
- **Never** conditionally render the contentEditable div — always use `display: none`.
- **Never** use `execCommand('unlink')` — it requires full link selection. Use DOM unwrap.
- **Never** use `setState({ ...state, ... })` in item mutators — always use `setState(prev => ...)`.
- **Never** use `Node.TEXT_NODE` or `Node.ELEMENT_NODE` — use the numeric literals `3` and `1`.
- **Always** check both `anchorNode` and `focusNode` when detecting link ancestry.
- **Always** put `onMouseDown={e => e.preventDefault()}` on the toolbar container so selection is not lost when clicking buttons.
- **Always** normalise `<b>`/`<i>` tags to `<strong>`/`<em>` in `handleInput` — `execCommand` output varies by browser.
- **Always** set `prevValueRef.current = null` initially (not `value`) so the first render loads the HTML into the editor.
- **Always** render `<ActionSet>` items below the editor for each `linkActions` entry.
- **Always** prefix `.rte-action-link` with the component's container class in `ScopedStyle`.


# RichTextEditor — Full Pattern

Use this component whenever an editor field needs inline bold, URL links, and Dot.vu action links — not just plain `<textarea>` or `TextInput`.

