---
name: quiz-component
description: >
  Rules and patterns for Dot.vu quiz components — stage structure (start, questions, end), per-stage typography inheritance via checkbox, optional prizes and lead forms, state shape, settings organization, and the required questions to ask the user before building. Use when building or reviewing any quiz-type component.
---

# Quiz Component Skill

## Before you build — required questions

**Always ask the user these questions before writing any code. Do not guess defaults.**

| #   | Question                                                                                    | Default if skipped |
| --- | ------------------------------------------------------------------------------------------- | ------------------ |
| 1   | What type of quiz is this? (**Personality / Typology**, Scored / Knowledge, Poll)           | Personality        |
| 2   | Does this quiz have a **start screen**?                                                     | Yes                |
| 3   | Does this quiz award **prizes** (e.g. a voucher, reward, or unlock)?                        | No                 |
| 4   | Does this quiz include a **lead form** (collect name, email, etc. before or after results)? | No                 |
| 5   | How should quiz results be determined? (**Tag matching**, Score threshold, Fixed)           | Tag matching       |
| 6   | Should questions be displayed **one at a time** or **all on one page**?                     | One at a time      |
| 7   | Should questions be **shuffled** randomly on each play?                                     | No                 |

Prizes and lead forms are **never mandatory**. Only scaffold them if the user confirms they are needed.

---

## Quiz stage structure

Every quiz has three stages rendered from the same component root:

```
start (optional)  →  questions  →  end / result
```

- **Start screen** — introductory panel with title, description, optional image, badge, and a primary CTA button.
- **Questions** — the core quiz loop. Each question has two to eight answers.
- **End / Result screen** — shows the winning result (or score). Includes optional restart button, optional CTA button, and a result badge.

Track the active stage with a single `activeView` string: `'start' | 'quiz' | 'result'`.

---

## Core state shape (common.js)

```js
// Stage control
showStartScreen: true,        // boolean — whether the start panel is shown before the quiz begins
completed: false,             // boolean — true once the result is determined
currentQuestion: 0,           // number  — 0-based index of the active question
selectedAnswers: [],          // array   — { questionId, answerId, resultTag }
resultTag: '',                // string  — the winning result tag

// Start screen content
startTitle: 'Quiz Title',
startDescription: 'Short intro copy.',
startImage: '',
showStartImage: false,
startButtonText: 'Start Quiz',
startButtonStyle: 'primary',
showQuizMeta: true,           // show estimated time or question count

// Badge (start screen)
startBadgeText: 'QUIZ',
startBadgeShape: 'pill',      // pill | pill-outline | rounded | rounded-outline | square | outline-square | flat
startBadgeColor: '#F57B37',
startBadgeFontColor: '',
startBadgeFont: '',
startBadgeFontWeight: 700,

// Badge (end screen)
endBadgeText: 'Your result',

// Questions + results
questions: [],                // see Question shape below
results: [],                  // see Result shape below
shuffleQuestions: false,
allowBack: true,
layout: 'oneAtATime',         // 'oneAtATime' | 'allOnOne'
seeResultsText: 'See Results',// label for All-On-One submit button

// End screen
showRestartButton: true,
restartButtonText: 'Retake quiz',
restartButtonStyle: 'secondary',

// Global typography (quiz questions stage)
headingFont: 'Poppins, sans-serif',
headingFontWeight: 700,
headingFontSize: 28,
headingLineHeight: 1.15,
headingColor: '#1C1C20',
bodyFont: 'Poppins, sans-serif',
bodyFontWeight: 400,
bodyFontSize: 16,
bodyLineHeight: 1.5,
textColor: '#1C1C20',
mutedTextColor: '#666666',
eyebrowFontSize: 12,

// Per-stage typography overrides
inheritStartTypography: true,           // when false, the fields below are active
startHeadingFont: '',
startHeadingFontWeight: 700,
startHeadingFontSize: 28,
startHeadingLineHeight: 1.15,
startHeadingColor: '',
startBodyFont: '',
startBodyFontWeight: 400,
startBodyFontSize: 16,
startBodyLineHeight: 1.5,
startBodyColor: '',

inheritResultTypography: true,          // when false, the fields below are active
resultHeadingFont: '',
resultHeadingFontWeight: 700,
resultHeadingFontSize: 28,
resultHeadingLineHeight: 1.15,
resultHeadingColor: '',
resultBodyFont: '',
resultBodyFontWeight: 400,
resultBodyFontSize: 16,
resultBodyLineHeight: 1.5,
resultBodyColor: '',

// Design
backgroundColor: '#F5F5F7',
surfaceColor: '#FFFFFF',
accentColor: '#F57B37',
borderColor: '#E5E7EB',
borderWidth: 1,
cardRadius: 12,
imageRadius: 12,
buttonBackgroundColor: '#F57B37',
buttonTextColor: '#FFFFFF',
buttonHoverBackgroundColor: '#F57B37',
buttonHoverTextColor: '#FFFFFF',
secondaryButtonBackgroundColor: '#FFFFFF',
secondaryButtonTextColor: '#F57B37',
answerBackgroundColor: '#FFFFFF',
progressColor: '#F57B37',
stepCounterColor: '',
showProgressBar: true,
showStepCounter: true,
endButtonAlignment: 'left',
```

### Question shape

```js
{
  id: '<uniqueId>',
  text: 'Question text',
  image: '',
  showImage: false,
  actionSet: [],              // runs on question answer (optional)
  answers: [
    { id: '<uniqueId>', text: 'Answer text', resultTag: 'tag-name' }
  ]
}
```

### Result shape (personality/typology quiz)

```js
{
  id: '<uniqueId>',
  tag: 'tag-name',            // slug — must be unique across results
  title: 'Result Title',
  description: 'Result description.',
  image: '',
  showTitle: true,
  showDescription: true,
  showImage: false,
  showCTA: true,
  ctaText: 'Learn More',
  ctaStyle: 'primary',
  ctaLink: '',
  ctaActionType: 'url',       // 'url' | 'trigger'
  ctaActionSet: []
}
```

---

## Per-stage typography inheritance pattern

This pattern lets each quiz stage (start and end/result) inherit the global question typography by default, but unlock its own overrides when the user opts in.

### How it works

1. **Global defaults** are set on `headingFont`, `headingFontSize`, etc. These always control the questions stage.
2. Each optional stage has an `inherit<Stage>Typography` boolean (defaults `true`).
3. When `inherit<Stage>Typography` is `true` → CSS variables read the global values.
4. When `inherit<Stage>Typography` is `false` → CSS variables read the per-stage values, falling back to the global values if the per-stage field is empty.

### State defaults (common.js)

```js
inheritStartTypography: getBooleanValue(state?.inheritStartTypography, true),
inheritResultTypography: getBooleanValue(state?.inheritResultTypography, true),
```

### CSS variables (live.js)

```js
// Start screen
'--quiz-start-heading-font':        state.inheritStartTypography !== false ? state.headingFont : (state.startHeadingFont || state.headingFont),
'--quiz-start-heading-size':        state.inheritStartTypography !== false ? `${s(state.headingFontSize)}px` : `${s(state.startHeadingFontSize || state.headingFontSize)}px`,
'--quiz-start-heading-weight':      state.inheritStartTypography !== false ? state.headingFontWeight : (state.startHeadingFontWeight || state.headingFontWeight),
'--quiz-start-heading-line-height': state.inheritStartTypography !== false ? state.headingLineHeight : (state.startHeadingLineHeight || state.headingLineHeight),
'--quiz-start-heading-color':       state.inheritStartTypography !== false ? resolvedHeadingColor : (state.startHeadingColor || resolvedHeadingColor),
'--quiz-start-body-font':           state.inheritStartTypography !== false ? state.bodyFont : (state.startBodyFont || state.bodyFont),
'--quiz-start-body-size':           state.inheritStartTypography !== false ? `${s(state.bodyFontSize)}px` : `${s(state.startBodyFontSize || state.bodyFontSize)}px`,
'--quiz-start-body-weight':         state.inheritStartTypography !== false ? state.bodyFontWeight : (state.startBodyFontWeight || state.bodyFontWeight),
'--quiz-start-body-line-height':    state.inheritStartTypography !== false ? state.bodyLineHeight : (state.startBodyLineHeight || state.bodyLineHeight),
'--quiz-start-body-color':          state.inheritStartTypography !== false ? resolvedTextColor : (state.startBodyColor || resolvedTextColor),

// Result screen
'--quiz-result-heading-font':        state.inheritResultTypography !== false ? state.headingFont : (state.resultHeadingFont || state.headingFont),
'--quiz-result-heading-size':        state.inheritResultTypography !== false ? `${s(state.headingFontSize)}px` : `${s(state.resultHeadingFontSize || state.headingFontSize)}px`,
'--quiz-result-heading-weight':      state.inheritResultTypography !== false ? state.headingFontWeight : (state.resultHeadingFontWeight || state.headingFontWeight),
'--quiz-result-heading-line-height': state.inheritResultTypography !== false ? state.headingLineHeight : (state.resultHeadingLineHeight || state.headingLineHeight),
'--quiz-result-heading-color':       state.inheritResultTypography !== false ? resolvedHeadingColor : (state.resultHeadingColor || resolvedHeadingColor),
'--quiz-result-body-font':           state.inheritResultTypography !== false ? state.bodyFont : (state.resultBodyFont || state.bodyFont),
'--quiz-result-body-size':           state.inheritResultTypography !== false ? `${s(state.bodyFontSize)}px` : `${s(state.resultBodyFontSize || state.bodyFontSize)}px`,
'--quiz-result-body-weight':         state.inheritResultTypography !== false ? state.bodyFontWeight : (state.resultBodyFontWeight || state.bodyFontWeight),
'--quiz-result-body-line-height':    state.inheritResultTypography !== false ? state.bodyLineHeight : (state.resultBodyLineHeight || state.bodyLineHeight),
'--quiz-result-body-color':          state.inheritResultTypography !== false ? resolvedTextColor : (state.resultBodyColor || resolvedTextColor),
```

### CSS class overrides (live.js styles)

```css
/* Start screen overrides — only applied via the class on the active panel */
.quiz-panel--start .quiz-title {
  font-family: var(--quiz-start-heading-font);
  font-size: var(--quiz-start-heading-size);
  font-weight: var(--quiz-start-heading-weight);
  line-height: var(--quiz-start-heading-line-height);
  color: var(--quiz-start-heading-color);
}
.quiz-panel--start .quiz-description {
  font-family: var(--quiz-start-body-font);
  font-size: var(--quiz-start-body-size);
  font-weight: var(--quiz-start-body-weight);
  line-height: var(--quiz-start-body-line-height);
  color: var(--quiz-start-body-color);
}

/* Result screen overrides */
.quiz-panel--result .quiz-result-title {
  font-family: var(--quiz-result-heading-font);
  font-size: var(--quiz-result-heading-size);
  font-weight: var(--quiz-result-heading-weight);
  line-height: var(--quiz-result-heading-line-height);
  color: var(--quiz-result-heading-color);
}
.quiz-panel--result .quiz-result-description {
  font-family: var(--quiz-result-body-font);
  font-size: var(--quiz-result-body-size);
  font-weight: var(--quiz-result-body-weight);
  line-height: var(--quiz-result-body-line-height);
  color: var(--quiz-result-body-color);
}
```

### Editor settings for one stage (editor.js)

Repeat this pattern for each overridable stage (`start`, `result`):

```jsx
<Section>
  <div className="quiz-settings-section-heading">start typography</div>
  <SettingItem>
    <Label
      content="Inherit quiz typography"
      help="When on, this stage uses the same heading and body font settings as the quiz questions. Turn off to customize typography independently for just this stage."
    />
    <Checkbox
      label="Inherit"
      value={state.inheritStartTypography !== false}
      onChange={(inheritStartTypography) =>
        updateStateField("inheritStartTypography", inheritStartTypography)
      }
    />
  </SettingItem>
  {state.inheritStartTypography === false ? (
    <>
      <div className="quiz-settings-subsection-heading">Heading</div>
      <div style={twoColumnStyle}>
        <SettingItem>
          <Label content="Font family" />
          <FontSelector
            value={state.startHeadingFont || state.headingFont}
            onChange={(startHeadingFont) =>
              updateStateField("startHeadingFont", startHeadingFont)
            }
          />
        </SettingItem>
        <SettingItem>
          <Label content="Color" />
          <ColorPicker
            value={state.startHeadingColor || state.headingColor}
            onChange={(startHeadingColor) =>
              updateStateField("startHeadingColor", startHeadingColor)
            }
          />
        </SettingItem>
        <SettingItem>
          <Label content="Font size" />
          <NumberInput
            min={16}
            max={80}
            step={1}
            value={state.startHeadingFontSize || state.headingFontSize}
            onChange={(startHeadingFontSize) =>
              updateStateField("startHeadingFontSize", startHeadingFontSize)
            }
          />
        </SettingItem>
        <SettingItem>
          <Label content="Font weight" />
          <Dropdown
            options={fontWeightOptions}
            value={state.startHeadingFontWeight || state.headingFontWeight}
            onChange={(startHeadingFontWeight) =>
              updateStateField("startHeadingFontWeight", startHeadingFontWeight)
            }
          />
        </SettingItem>
        <SettingItem>
          <Label content="Line height" />
          <NumberInput
            min={0.8}
            max={2}
            step={0.05}
            value={state.startHeadingLineHeight || state.headingLineHeight}
            onChange={(startHeadingLineHeight) =>
              updateStateField("startHeadingLineHeight", startHeadingLineHeight)
            }
          />
        </SettingItem>
      </div>
      <div className="quiz-settings-subsection-heading">Body</div>
      <div style={twoColumnStyle}>
        <SettingItem>
          <Label content="Font family" />
          <FontSelector
            value={state.startBodyFont || state.bodyFont}
            onChange={(startBodyFont) =>
              updateStateField("startBodyFont", startBodyFont)
            }
          />
        </SettingItem>
        <SettingItem>
          <Label content="Color" />
          <ColorPicker
            value={state.startBodyColor || state.textColor}
            onChange={(startBodyColor) =>
              updateStateField("startBodyColor", startBodyColor)
            }
          />
        </SettingItem>
        <SettingItem>
          <Label content="Font size" />
          <NumberInput
            min={12}
            max={28}
            step={1}
            value={state.startBodyFontSize || state.bodyFontSize}
            onChange={(startBodyFontSize) =>
              updateStateField("startBodyFontSize", startBodyFontSize)
            }
          />
        </SettingItem>
        <SettingItem>
          <Label content="Font weight" />
          <Dropdown
            options={fontWeightOptions}
            value={state.startBodyFontWeight || state.bodyFontWeight}
            onChange={(startBodyFontWeight) =>
              updateStateField("startBodyFontWeight", startBodyFontWeight)
            }
          />
        </SettingItem>
        <SettingItem>
          <Label content="Line height" />
          <NumberInput
            min={1}
            max={2.5}
            step={0.05}
            value={state.startBodyLineHeight || state.bodyLineHeight}
            onChange={(startBodyLineHeight) =>
              updateStateField("startBodyLineHeight", startBodyLineHeight)
            }
          />
        </SettingItem>
      </div>
    </>
  ) : null}
</Section>
```

---

## Settings tab organization (editor.js)

Use this tab order. Only include tabs relevant to the quiz variant being built.

| Tab           | Sections                                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Start**     | Welcome (show start screen toggle, title, description, image, button, quiz meta) → Badge                                                                                           |
| **Questions** | Question list (TableContainer + Drawer) → Results / End cards (TableContainer + Drawer)                                                                                            |
| **End**       | See Results button → Restart Quiz → CTA Button → Button layout → Badge                                                                                                             |
| **Style**     | Badge → Question text typography → Answer text typography → Start typography (inherit checkbox) → Result typography (inherit checkbox) → Question layout → Colors → Card & spacing |
| **Behavior**  | Back button, shuffle, motion, action sets                                                                                                                                          |

> **Start and End are always separate tabs.** Never merge them into a single "Start & End" tab, even for simple quizzes. Content (title, description, button) belongs in each respective tab; typography for both screens belongs in the Style tab.

> **Screen typography goes in the Style tab.** Do not place font, size, or color controls inside the Start or End content tabs. When the component uses shared typography fields that apply to both screens, show them as one "Screen typography" section in Style with a `Label` help prop reading "Applied to both the start and end screens."

### Section heading CSS

```css
.quiz-settings-section-heading {
  margin: 0 0 12px 0;
  color: #000000;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.quiz-settings-subsection-heading {
  margin: 16px 0;
  padding-top: 16px;
  color: #000000;
  font-size: 14px;
  letter-spacing: 0.02em;
  font-weight: 700;
  line-height: 1.2;
  text-transform: capitalize;
}
```

---

## Optional features

### Prizes

Only add prizes when the user confirms the quiz awards one. Prizes are typically tied to a result (e.g. `result.prize`, `result.prizeCode`) and shown on the end screen.

Scaffold pattern:

- Add `hasPrize: false` and `prizeCode: ''` (or per-result prize fields) to common.js state.
- Add a "Prize" section to the End tab or per-result Drawer.
- Render prize details on the result panel in live.js only when `hasPrize` is true.

Do not add prize fields, UI, or CSS unless the user confirms prizes are needed.

### Lead form

Only add a lead form when the user confirms it is needed. Lead forms typically appear:

- **Before results** — after all questions are answered, before the result is revealed (most common for gating).
- **After results** — below the result screen as an optional follow-up.

Scaffold pattern:

- Add `hasLeadForm: false`, `leadFormPosition: 'before-result'`, and field config to state.
- Add a "Lead Form" section to the End tab.
- Integrate with the `form-component` skill for validation and submit patterns.
- Gate the result display on `state.leadFormSubmitted` when `leadFormPosition === 'before-result'`.

Do not add lead form fields, UI, or CSS unless the user confirms a lead form is needed.

---

## Result determination

### Personality / Typology (tag matching)

Count how many answers map to each result tag. The result with the highest count wins. First result in the list wins ties.

```js
function getWinningResult(results, selectedAnswers) {
  const tagCounts = (selectedAnswers || []).reduce((counts, answer) => {
    if (!answer?.resultTag) return counts;
    return {
      ...counts,
      [answer.resultTag]: (counts[answer.resultTag] || 0) + 1,
    };
  }, {});

  let winner = null;
  let highest = -1;
  (results || []).forEach((result) => {
    const count = tagCounts[result.tag] || 0;
    if (count > highest) {
      highest = count;
      winner = result;
    }
  });
  return winner || results?.[0] || null;
}
```

### Scored / Knowledge

Total correct answers or points. Map score ranges to results.

```js
function getResultByScore(results, score) {
  // results should include { minScore, maxScore } fields
  return (
    results.find((r) => score >= r.minScore && score <= r.maxScore) ||
    results[results.length - 1] ||
    null
  );
}
```

---

## Key implementation rules

- Always use `getUniqueId()` from `@utils` for new question, answer, and result IDs.
- Always normalize tags to lowercase slugs: `/[^a-z0-9]+/g → '-'`.
- Ensure result tags stay unique across results. Re-slug answers when a tag changes.
- Minimum 2 answers per question; maximum 8.
- Minimum 1 result; do not allow deleting the last result.
- Never auto-complete in `allOnOne` mode — completion requires an explicit submit action.
- When `showStartScreen` is false, skip the start stage entirely and enter the quiz directly.
- Questions drawer and results drawer use the same `TableContainer` + `Drawer` pattern as documented in the `settings-table` skill.
- Per-stage typography fields fall back to global values: always use `state.startHeadingFont || state.headingFont` (never just `state.startHeadingFont`) in CSS variable assignments.
