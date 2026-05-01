---
name: settings-url-input
description: "Rules and patterns for using native URL inputs in editor.js — full URL validation, Label pairing, inline errors, and debounced save behavior. Use when a settings field should capture a browser-style URL instead of generic text."
---

# Native URL Input — Usage Rule

## Rule

Use a native `<input type="url">` when a settings field is specifically a URL and should follow browser URL semantics.

- **Do** pair every URL input with a `Label` in the same `<SettingItem>`.
- **Do** use `type="url"` and a clear placeholder or help message that shows the expected full format.
- **Do** validate full `http` or `https` URLs with `new URL(...)` when the field must reject partial or relative values.
- **Do** keep invalid text visible in the field while showing a visible inline error message.
- **Do** debounce persistence when validation should wait until the user pauses typing.
- **Do not** rely only on browser-native validation bubbles for editor UX.
- **Do not** replace a URL field with `TextInput` when native URL semantics are the goal.

## Patterns

### Basic URL input

```jsx
<SettingItem>
  <Label content="Link URL" help="Enter a full URL including https://." />
  <input
    className="my-url-input"
    type="url"
    value={state.linkUrl}
    onChange={(e) => setState({ ...state, linkUrl: e.currentTarget.value })}
  />
</SettingItem>
```

### URL input with full validation

```js
function isValidAbsoluteUrl(urlValue) {
  const trimmedUrl = typeof urlValue === "string" ? urlValue.trim() : "";

  if (!trimmedUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    return (
      /^(http|https):$/i.test(parsedUrl.protocol) && Boolean(parsedUrl.hostname)
    );
  } catch {
    return false;
  }
}
```

```jsx
<SettingItem>
  <Label
    content="Link URL"
    help="Enter a full URL including https://, for example https://example.com/page."
  />
  <input
    className="my-url-input"
    type="url"
    value={linkInput}
    onChange={(e) => setLinkInput(e.currentTarget.value)}
  />
  {linkError && <div className="my-input-error">{linkError}</div>}
</SettingItem>
```

### Debounced URL input in a Drawer

```js
const [linkInput, setLinkInput] = useState("");
const [linkError, setLinkError] = useState("");

useEffect(() => {
  if (!selectedItem || selectedItem.linkType !== "url") {
    return undefined;
  }

  const validationTimer = setTimeout(() => {
    if (!isValidAbsoluteUrl(linkInput)) {
      setLinkError(
        "Use a full valid URL, for example https://example.com/page.",
      );
      return;
    }

    setLinkError("");
    updateItem(selectedItem.id, { linkUrl: linkInput.trim() });
  }, 400);

  return () => clearTimeout(validationTimer);
}, [linkInput, selectedItem]);
```

```jsx
<DrawerSection>
  <SettingItem>
    <Label content="Link URL" help="Enter a full URL including https://." />
    <input
      className="my-url-input"
      type="url"
      value={linkInput}
      onChange={(e) => {
        setLinkInput(e.currentTarget.value);
        setLinkError("");
      }}
    />
    {linkError && <div className="my-input-error">{linkError}</div>}
  </SettingItem>
</DrawerSection>
```

### Shared CSS for native URL input

```css
.my-url-input {
  width: 100%;
  min-height: 36px;
  box-sizing: border-box;
  padding: 7px 10px;
  border: 1px solid #999999;
  border-radius: 4px;
  background: #ffffff;
  color: #595959;
  font-size: 14px;
  line-height: 1.4;
}

.my-url-input:focus {
  outline: none;
  border-color: #4c9ffe;
}

.my-input-error {
  margin-top: 8px;
  color: #c62828;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}
```

## Quick reference

| Situation                                          | Pattern                                                 |
| -------------------------------------------------- | ------------------------------------------------------- |
| Simple URL field                                   | Native `<input type="url">` with `Label`                |
| URL must be a full `http` or `https` URL           | Native input plus `new URL(...)` validation             |
| URL edited inside a Drawer                         | Native input with debounced validation and inline error |
| Error must stay visible while invalid text remains | Keep input value local and render an inline error div   |

## What not to do

```jsx
// ❌ Generic text input when the field is specifically a URL
<TextInput value={state.linkUrl} onChange={...} />

// ❌ Browser-only validation with no visible editor feedback
<input type="url" value={linkInput} onChange={...} />

// ❌ Clearing the user's invalid text immediately
if (!isValidAbsoluteUrl(linkInput)) {
  updateItem(selectedItem.id, { linkUrl: '' })
}
```
