---
mode: ask
description: Output a Dot.vu component as a strict three-file manifest for copy-paste workflows
---

# Output Dot.vu Component as Three Files

Use this prompt only when the user explicitly asks for a copy-paste manifest instead of in-place edits.

Follow all Dot.vu component rules:

#file:.github/instructions/dotvu-component.instructions.md
#file:.github/prompts/dotvu-api-reference.prompt.md

## Output format

Return exactly three files in this order and no extra prose:

````md
FILE: /common/index.js
```js
<file content here>
```
END

FILE: /editor/index.js
```js
<file content here>
```
END

FILE: /live/index.js
```js
<file content here>
```
END
````

## Rules

- Output all three files, even for small edits.
- Do not add explanations outside the file blocks.
- Do not use this format in VSCode agent mode unless explicitly requested.
