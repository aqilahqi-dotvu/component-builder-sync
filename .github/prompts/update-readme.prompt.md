---
mode: agent
description: Update README.md to reflect new or removed skills, prompts, or instructions
---

# Update README

Use this prompt when a skill, prompt, or instruction file has been added, removed, or renamed and the README is out of sync.

Read first:

#file:README.md
#file:.github/copilot-instructions.md

Then scan the actual files on disk:

- `.github/skills/` — one subfolder per skill, each containing a `SKILL.md`
- `.github/prompts/` — one `.prompt.md` per prompt
- `.github/instructions/` — one `.instructions.md` per instruction file

## What to update

Compare what exists on disk against what is documented in the README. Then apply the minimal edits needed to make the README accurate.

### Skills table (`### \`.github/skills/\`` section)

Each skill folder must have a row. Columns:

| Column  | Source                                                        |
| ------- | ------------------------------------------------------------- |
| Skill   | Folder name as `\`folder-name/\``                             |
| Command | `/folder-name`                                                |
| Purpose | One sentence from the skill's `description` frontmatter field |

### Prompts table (`#### \`.github/prompts/\`` section)

Each `.prompt.md` file must have a row. Columns:

| Column  | Source                                                         |
| ------- | -------------------------------------------------------------- |
| Prompt  | Filename as `\`filename.prompt.md\``                           |
| Command | `/` + filename without the `.prompt.md` suffix                 |
| Purpose | One sentence from the prompt's `description` frontmatter field |

### Instructions table (`#### \`.github/instructions/\`` section)

Each `.instructions.md` file must have a row. Columns:

| Column  | Source                                                                                  |
| ------- | --------------------------------------------------------------------------------------- |
| File    | Filename as `\`filename.instructions.md\``                                              |
| Purpose | One sentence from the file's `description` frontmatter field, or infer from the content |

## Rules

- Do not rewrite prose sections — only update the three tables above.
- Preserve the existing row order; append new rows at the bottom of the relevant table.
- Remove rows whose files no longer exist on disk.
- Do not change any other part of README.md.
- Edit README.md in place — do not return a code block.
