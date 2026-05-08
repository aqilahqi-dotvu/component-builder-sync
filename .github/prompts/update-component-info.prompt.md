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
      name: "...",
      Setting: Settings,
      width: 500,
      help: (state) => ({
        title: "...",
        content: <> ... </>,
      }),
    },
  };
}
```

Fields to keep in sync:

| Field     | Should match                                  |
| --------- | --------------------------------------------- |
| `name`    | The component's display name                  |
| `title`   | `"{name} Help"`                               |
| `content` | Current tabs, sections, actions, and triggers |

## Content structure

Use this JSX structure for the `content` value. It is easy to skim and avoids walls of plain text.

```jsx
content: (
  <>
    <h1>{Component Name}</h1>
    <p>One sentence describing what the component does.</p>

    <h3><strong>How it works</strong></h3>
    <ul>
      <li>Bullet summarising one core behaviour.</li>
      {/* one <li> per major concept */}
    </ul>
    <br /><br />

    <h3><strong>Tabs and settings overview</strong></h3>
    <br />

    <h4><strong>{Tab Name} tab</strong></h4>
    <p>One sentence describing the tab's purpose.</p>
    <ul>
      <li><strong>{Setting label}</strong>: What it controls.</li>
      <li>
        <strong>{Setting label}</strong> (when visible):
        <ul>
          <li><strong>{Sub-setting}</strong>: What it controls.</li>
        </ul>
      </li>
    </ul>

    {/* Repeat <h4> + <p> + <ul> for each tab */}

    <br /><br />
    <h3><strong>Tips for a great experience</strong></h3>
    <ul>
      <li>Actionable tip.</li>
    </ul>
  </>
)
```

### Rules

- Use `<h1>` once — for the component name.
- Use `<h3><strong>…</strong></h3>` for major sections: "How it works", "Tabs and settings overview", and "Tips for a great experience".
- Use `<h4><strong>…</strong></h4>` for each tab heading — match the tab titles exactly as they appear in the editor.
- Add `<br /><br />` between major `<h3>` sections and between the last tab block and the Tips section.
- Add a single `<br />` between the `<h3>Tabs and settings overview</h3>` heading and the first `<h4>`.
- Use `<ul>` + `<li>` for settings within each group. Each `<li>` should follow the pattern: `<strong>Label</strong>: explanation.`
- Use nested `<ul>` inside a `<li>` for sub-settings that only appear when a parent toggle is enabled, noting the condition in parentheses (e.g. `(when the chart is visible)`).
- Use `<strong>` for setting names, button labels, and action names.
- Use `<em>` for option values (e.g. `<em>On load</em>`, `<em>Manual trigger</em>`).
- Keep each `<li>` to one sentence where possible.
- Do not add a tab section for tabs that have no notable settings to explain.
- Do not describe internal implementation details — only what the user sees and controls.

## Pre-submit checklist

- [ ] `name` matches the component's actual display name?
- [ ] `title` is `"{name} Help"`?
- [ ] Every editor tab with user-facing settings has an `<h2>` section?
- [ ] Every setting in the help article still exists in the editor?
- [ ] No settings removed from the editor are still mentioned in the article?
- [ ] Actions and triggers referenced in the article match `getActions` and `getTriggers`?
