---
name: settings-dropdown
description: "Rules and patterns for using Dropdown controls in editor.js — { value, text } option shape, onChange receives value directly (not event), always pair with Label, extract reused option arrays as named consts. Use when adding single-choice select controls to editor settings."
---

# Dropdown — Usage Rule

## Rule

Use `Dropdown` when the user must choose exactly one value from a fixed set of options.

- **Do** use `{ value, text }` for every option object. Do not use `label`, `name`, or any other key.
- **Do** receive the new value directly in `onChange` — it is not a DOM event.
- **Do** always pair a `Dropdown` with a `Label` in the same `<SettingItem>`.
- **Do** add a `help` attribute to `Label` when the choice needs a sentence of context.
- **Do** extract repeated option arrays as a named `const` above the `Settings` function.
- **Do not** use `Dropdown` for a simple on/off toggle — use `Checkbox` instead.
- **Do not** pass `onChange` an arrow function that forwards a DOM event object.

---

## Patterns

### Simple dropdown — no explanation needed

```jsx
<SettingItem>
  <Label content="Animation Type" />
  <Dropdown
    value={state.animationType}
    options={[
      { value: "none", text: "None" },
      { value: "pulse", text: "Pulse" },
      { value: "bounce", text: "Bounce" },
    ]}
    onChange={(animationType) => setState({ ...state, animationType })}
  />
</SettingItem>
```

### Dropdown that needs explanation — use Label with help

```jsx
<SettingItem>
  <Label
    content="Start Mode"
    help="Choose whether the animation starts automatically when the component renders or only after the Start Animation action is triggered."
  />
  <Dropdown
    value={state.loadingMode}
    options={[
      { value: "onLoad", text: "On Load" },
      { value: "manual", text: "Manual" },
    ]}
    onChange={(loadingMode) => setState({ ...state, loadingMode })}
  />
</SettingItem>
```

### Reused options — extract as a named const above Settings

```jsx
const fontWeightOptions = [
  { value: "100", text: "Thin - 100" },
  { value: "400", text: "Regular - 400" },
  { value: "700", text: "Bold - 700" },
  { value: "900", text: "Black - 900" },
];

function Settings({ state, setState }) {
  return (
    <>
      <SettingItem>
        <Label
          content="Heading Weight"
          help="Some fonts may not include every weight shown here."
        />
        <Dropdown
          value={state.headingFontWeight}
          options={fontWeightOptions}
          onChange={(headingFontWeight) =>
            setState({ ...state, headingFontWeight })
          }
        />
      </SettingItem>
      <SettingItem>
        <Label
          content="Body Weight"
          help="Some fonts may not include every weight shown here."
        />
        <Dropdown
          value={state.descriptionFontWeight}
          options={fontWeightOptions}
          onChange={(descriptionFontWeight) =>
            setState({ ...state, descriptionFontWeight })
          }
        />
      </SettingItem>
    </>
  );
}
```

### Dropdown with side effects — update multiple state fields on change

```jsx
<Dropdown
  value={state.loadingMode}
  options={[
    { value: "onLoad", text: "On Load" },
    { value: "manual", text: "Manual" },
  ]}
  onChange={(loadingMode) =>
    setState({
      ...state,
      loadingMode,
      hasStartedLoading: loadingMode === "onLoad",
    })
  }
/>
```

---

## Quick reference

| Situation                               | Pattern                                             |
| --------------------------------------- | --------------------------------------------------- |
| Simple single-choice selection          | `Dropdown` with inline options and short `Label`    |
| Choice needs a sentence of context      | `Label` with `help`, then `Dropdown`                |
| Same options used in multiple dropdowns | Extract options as a named `const` above `Settings` |
| Selection affects other state fields    | Compute derived values inside `onChange`            |

---

## What not to do

```jsx
// ❌ Wrong option shape — use { value, text }, not { value, label }
options={[{ value: 'url', label: 'Open URL' }]}

// ❌ Forwarding a DOM event — Dropdown gives you the value directly
onChange={e => setState({ ...state, animationType: e.target.value })}

// ❌ Missing Label — user has no context for what this selects
<Dropdown value={state.mode} options={[...]} onChange={...} />
```
