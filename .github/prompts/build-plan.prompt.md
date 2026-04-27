---
agent: dotvu-component-builder
description: Plan a component build before starting
---

# Build Plan — Dot.vu Component

Read the boilerplate first to understand what patterns are available:
#file:.github/prompts/dotvu-api-reference.prompt.md

## Step 1 — Ask clarifying questions

Do not write any code or create files. Send the user this message:

---

**Let's plan this component before building.**

**Describe what you want to build:** (What does it do? What does the editor control? What content is dynamic?)

**Once you give me the description, I'll create a written plan covering:**
- What each tab in the settings will contain (Content, Style, Animation, Advanced)
- What state fields are needed
- What dynamic behaviors or interactivity exist
- What patterns from the boilerplate apply

*Reply with your description and I'll draft the plan.*

---

## Step 2 — Create the written plan

Based on the user's description, draft a plan that covers:

1. **Component overview** — 1–2 sentences of what it does
2. **Settings structure** — List each tab and what sections/controls go in it
3. **State fields** — List all state fields needed, grouped by purpose
4. **Behaviors** — Animation? List management? Responsive breakpoints?
5. **Boilerplate patterns** — Which patterns from the icon card boilerplate apply (ResizeObserver, animation system, drag-to-reorder, shadow controls, etc.)
6. **Questions for you** — Any ambiguities to clarify before building?

Send this plan to the user as a numbered outline and ask: **"Does this match what you want? Any changes before I build?"**

## Step 3 — Wait for approval

Do not proceed to building until the user confirms the plan. If they request changes, update the plan and ask again.

## Step 4 — Hand off to build

Once approved, respond with:

**"Plan approved. Ready to build. Use `/new-component` with this plan, or just say "Build this" and I'll create the three files."**

Do not actually build — let the user decide if they want to use the `/new-component` flow or just ask you directly.