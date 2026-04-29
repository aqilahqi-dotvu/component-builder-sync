---
name: checkbox
description: 'Rules and patterns for using Checkbox controls in editor.js — short labels only, no description prop, use Label with help for context, grouping pattern. Use when adding toggle controls to editor settings.'
---

# Checkbox — Usage Rule

## Rule

A `Checkbox` label must be short, plain, and self-explanatory on its own.

- **Do** keep the `label` to 3–5 words maximum.
- **Do not** use a `description` attribute on the checkbox. The component does not support it.
- **Do not** write explanatory prose inside the `label` string.

When a checkbox needs extra context, place a `Label` with a `help` attribute **above** it in the same `Section`. Keep the checkbox `label` short.

---

## Patterns

### Simple checkbox — no explanation needed

```jsx
<SettingItem>
  <Checkbox
    value={state.hasShadow}
    onChange={hasShadow => setState({ ...state, hasShadow })}
    label="Show shadow"
  />
</SettingItem>
```

### Checkbox that needs explanation — use Label with help

```jsx
<SettingItem>
  <Label
    content="Start Mode"
    help="Choose whether the animation starts automatically when the component renders or only after the Start Animation action is triggered."
  />
  <Checkbox
    value={state.autoStart}
    onChange={autoStart => setState({ ...state, autoStart })}
    label="Start on load"
  />
</SettingItem>
```

### Group of related checkboxes — one Label introduces the group

```jsx
<SettingItem>
  <Label
    content="Expose Triggers"
    help="Triggers are outbound events. Enable the ones you want this component to expose so external logic can react when those events happen."
  />
</SettingItem>
<SettingItem>
  <Checkbox
    value={state.exposeOnCardClick}
    onChange={exposeOnCardClick => setState({ ...state, exposeOnCardClick })}
    label="On Card Click"
  />
</SettingItem>
<SettingItem>
  <Checkbox
    value={state.exposeOnAnimationEnd}
    onChange={exposeOnAnimationEnd => setState({ ...state, exposeOnAnimationEnd })}
    label="On Animation End"
  />
</SettingItem>
```

---

## Quick reference

| Situation | Pattern |
|---|---|
| Simple toggle, obvious meaning | Checkbox with short `label` only |
| Toggle needs a sentence of context | `Label` with `help`, then `Checkbox` with short `label` |
| Group of toggles sharing one explanation | Single `Label` with `help`, then one `Checkbox` per `SettingItem` |

---

## What not to do

```jsx
// ❌ Label is too long
<Checkbox label="Enable shadow on hover only when the card is hovered by the user" ... />

// ❌ description attribute does not exist on Checkbox
<Checkbox description="Shows a shadow when hovered" label="Hover shadow" ... />

// ❌ Missing Label — user has no context for what this toggles
<Checkbox label="Enable" ... />
```
