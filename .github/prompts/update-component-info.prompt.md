---
agent: dotvu-component-builder
description: Update the getSettings help article to reflect the current component
---

# Update Component Info

Use this prompt when the `getSettings` help content is out of date or needs to be written from scratch.

Read first:

#file:.github/instructions/dotvu-component.instructions.md
#file:editor.js

## What to update

The help article lives inside `getSettings` in `editor.js`:

```js
export function getSettings(state) {
  return {
    settings: {
      name: '...',
      Setting: Settings,
      width: 500,
      help: state => ({
        title: '...',
        content: ( <> ... </> )
      })
    }
  }
}
```

Fields to keep in sync:

| Field | Should match |
|---|---|
| `name` | The component's display name |
| `title` | `"{name} Help"` |
| `content` | Current tabs, sections, actions, and triggers |

## Content structure

Use this JSX structure for the `content` value. It is easy to skim and avoids walls of plain text.

```jsx
content: (
  <>
    <h1>{Component Name}</h1>
    <p>One sentence describing what the component does.</p>

    <h2>{Tab Name} tab</h2>
    <ul>
      <li><strong>{Setting label}</strong> — what it controls.</li>
      <li><strong>{Setting label}</strong> — what it controls.</li>
    </ul>

    {/* Repeat an <h2> + <ul> block for each tab */}
  </>
)
```

### Rules

- Use `<h1>` once — for the component name.
- Use `<h2>` per tab or major feature group — match the tab titles in the editor.
- Use `<ul>` + `<li>` for settings within each group. Each `<li>` should follow the pattern: `<strong>Label</strong> — explanation.`
- Use `<strong>` for setting names, button labels, and action names.
- Use `<em>` for option values (e.g. `<em>On Load</em>`).
- Keep each `<li>` to one sentence.
- Do not add a tab section for tabs that have no notable settings to explain.
- Do not describe internal implementation details — only what the user sees and controls.

## Pre-submit checklist

- [ ] `name` matches the component's actual display name?
- [ ] `title` is `"{name} Help"`?
- [ ] Every editor tab with user-facing settings has an `<h2>` section?
- [ ] Every setting in the help article still exists in the editor?
- [ ] No settings removed from the editor are still mentioned in the article?
- [ ] Actions and triggers referenced in the article match `getActions` and `getTriggers`?
