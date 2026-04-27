# Dot.vu Component Builder Sync

This repository shares the agent, Copilot instructions, prompts, and templates used to build Dot.vu components. The goal is to streamline our workflow and ensure every component follows the same standards — consistent structure, editor UX, and code patterns — regardless of who builds it.

---

## Getting Started

### Option A — GitHub Desktop (easier)

1. Install [GitHub Desktop](https://desktop.github.com/download/) if you haven't already.
2. Sign in to your GitHub account inside the app.
3. On this repository's page, click the green **`<> Code`** button (top right) and select **Open with GitHub Desktop**.
4. Choose a local path and clone.

### Option B — Command line

```bash
git clone https://github.com/aqilahqi-dotvu/component-builder-sync.git
```

Open the cloned folder in VS Code. The `.github/` folder will be picked up automatically by GitHub Copilot.

When you're ready to start building a component, switch your Copilot Chat agent to **`dotvu-component-builder`**. This activates the custom instructions and prompt workflows defined in this repo.

---

## Folder Structure

### `.github/`

Contains everything that configures the Copilot agent's behaviour in this repo.

#### `.github/agents/`

| File | Purpose |
|---|---|
| `dotvu-component-builder.agent.md` | Defines the custom agent mode. Sets the model, tool access, and links to the component instructions. Switch to this agent in Copilot Chat before building. |

#### `.github/instructions/`

| File | Purpose |
|---|---|
| `dotvu-component.instructions.md` | The core coding rules for all component files (`common.js`, `editor.js`, `live.js`). Applied automatically when editing those files. Covers state field conventions, tab/section structure, animation patterns, and what the Dot.vu runtime supports. |

#### `.github/prompts/`

Slash commands you invoke in Copilot Chat. Each prompt targets a specific task in the component workflow.

| Prompt | Command | Purpose |
|---|---|---|
| `build-plan.prompt.md` | `/build-plan` | **Plan before you build.** The agent asks clarifying questions, produces a written plan covering tabs, state fields, and behaviors, and waits for your approval before any code is written. |
| `new-component.prompt.md` | `/new-component` | Scaffold a brand-new component from scratch using the boilerplate patterns. |
| `edit-component.prompt.md` | `/edit-component` | Modify an existing component safely, preserving existing state and structure. |
| `review-component.prompt.md` | `/review-component` | Check a component for compliance with the coding standards. |
| `fix-component.prompt.md` | `/fix-component` | Debug or repair a broken component. |
| `add-table-list.prompt.md` | `/add-table-list` | Add a dynamic, reorderable list to an existing component. |
| `convert-to-breakpoint-aware.prompt.md` | `/convert-to-breakpoint-aware` | Add responsive height/breakpoint behavior to a component. |
| `dotvu-api-reference.prompt.md` | `/dotvu-api-reference` | The full API and pattern reference. Useful for checking what the runtime supports. |
| `output-three-files.prompt.md` | `/output-three-files` | Output the final `common.js`, `editor.js`, and `live.js` files. |
| `svgpicker.prompt.md` | `/svgpicker` | Add an SVG icon picker control to the editor. |
| `checkbox.prompt.md` | `/checkbox` | Rules and patterns for using `Checkbox` controls — short labels, no `description` attribute, and when to use a `Label` with `help` instead. |
| `section-headings.prompt.md` | `/section-headings` | Rules and patterns for `SectionHeading` and `SubSectionHeading` — when to use each, correct CSS, and what not to do. |

---

### `templates/`

Reference templates and boilerplate used by the prompts when generating new components.

| File | Purpose |
|---|---|
| `boilerplate.md` | The standard icon card boilerplate. Contains the full patterns for ResizeObserver, the animation system, shadow controls, drag-to-reorder, and breakpoint handling. New components are built from this. |
| `list-component.md` | A boilerplate specifically for list-style components with reorderable items. |

---

## How the Agent Works

The `dotvu-component-builder` agent is **plan-first by default**. Every prompt workflow includes a planning phase — the agent will ask clarifying questions and produce a written plan before writing any code.

**You must explicitly tell the agent to start building.** It will not write code until you approve the plan or say "Build this."

If you want to skip straight to building, include that intent in your initial message:

> "Build this immediately — [description]"

---

## The `/build-plan` Workflow

Use `/build-plan` when you want to think through a component before committing to code. This is the recommended starting point for any non-trivial component.

### How to invoke it

In Copilot Chat (with the `dotvu-component-builder` agent active), type:

```
/build-plan I want to create a testimonial card that displays a customer quote, their name, and a profile image. The editor should control the background color, text colors, spacing, and whether to show a star rating.
```

Or describe your idea informally and then say:

> "Let's plan this first."

The agent will respond with the `/build-plan` prompt flow.

### The workflow in action

```
User:   /build-plan + description
Agent:  Asks clarifying questions
User:   Replies with details
Agent:  Creates a written plan covering tabs, state fields, and behaviors
User:   Approves or requests changes
Agent:  Hands off to /new-component or builds directly on request
```

This forces a pause before code is written, catches ambiguities early, and ensures you and the agent are aligned on what's being built before a single file is touched.

---

## Runtime Files

Every component is implemented with exactly three files:

| File | Purpose |
|---|---|
| `common.js` | Shared state schema and default values |
| `editor.js` | Editor UI — tabs, sections, controls |
| `live.js` | The rendered live component |

Do not add extra files or package dependencies unless the Dot.vu runtime explicitly supports them.
