FILE: /common/index.js

```javascript
import { getUniqueId } from "@utils";

const DEFAULT_TOP_CTA_SUFFIX_ICON =
  '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function normalizeSvgRoot(svgMarkup) {
  return svgMarkup.replace(/<svg\b([^>]*)>/i, (match, attributes) => {
    const widthMatch = attributes.match(/\bwidth=["']([\d.]+)["']/i);
    const heightMatch = attributes.match(/\bheight=["']([\d.]+)["']/i);
    const hasViewBox = /\bviewBox=/i.test(attributes);
    const cleanedAttributes = attributes
      .replace(/\swidth=["'][^"']*["']/gi, "")
      .replace(/\sheight=["'][^"']*["']/gi, "");

    const derivedViewBox =
      !hasViewBox && widthMatch && heightMatch
        ? ` viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`
        : "";

    return `<svg${cleanedAttributes}${derivedViewBox}>`;
  });
}

export function normalizeSvgMarkup(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const normalizedRoot = normalizeSvgRoot(trimmedValue);

  return normalizedRoot
    .replace(/fill=(['"])(?!none\1)([^'"]*)(\1)/gi, "fill=$1currentColor$1")
    .replace(
      /stroke=(['"])(?!none\1)([^'"]*)(\1)/gi,
      "stroke=$1currentColor$1",
    );
}

function getNumberValue(value, fallback) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function getOptionalNumberValue(value) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : undefined;
}

function hasOwnValue(source, key) {
  return Boolean(source) && Object.prototype.hasOwnProperty.call(source, key);
}

function getStringValue(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

const DEFAULT_SLIDES = [
  {
    id: getUniqueId(),
    client: "Client Name",
    headline: "Lorem ipsum dolor sit amet consectetur",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "https://placehold.co/1200x600/cccccc/000000?text=Slide+1",
    bgColor: "#ffffff",
    textColor: "#000000",
    allProjectsText: "View all projects",
    allProjectsTextCleared: false,
    showAllProjectsCta: true,
    allProjectsHasSuffixIcon: true,
    allProjectsSuffixIcon: DEFAULT_TOP_CTA_SUFFIX_ICON,
    allProjectsActionType: "trigger",
    allProjectsUrl: "",
    allProjectsActionSet: [],
  },
  {
    id: getUniqueId(),
    client: "Client Name",
    headline: "Ut enim ad minim veniam quis nostrud",
    body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://placehold.co/1200x600/cccccc/000000?text=Slide+2",
    bgColor: "#ffffff",
    textColor: "#000000",
    allProjectsText: "View all projects",
    allProjectsTextCleared: false,
    showAllProjectsCta: true,
    allProjectsHasSuffixIcon: true,
    allProjectsSuffixIcon: DEFAULT_TOP_CTA_SUFFIX_ICON,
    allProjectsActionType: "trigger",
    allProjectsUrl: "",
    allProjectsActionSet: [],
  },
  {
    id: getUniqueId(),
    client: "Client Name",
    headline: "Duis aute irure dolor in reprehenderit",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    image: "https://placehold.co/1200x600/cccccc/000000?text=Slide+3",
    bgColor: "#ffffff",
    textColor: "#000000",
    allProjectsText: "View all projects",
    allProjectsTextCleared: false,
    showAllProjectsCta: true,
    allProjectsHasSuffixIcon: true,
    allProjectsSuffixIcon: DEFAULT_TOP_CTA_SUFFIX_ICON,
    allProjectsActionType: "trigger",
    allProjectsUrl: "",
    allProjectsActionSet: [],
  },
];

function getLegacyTopCtaState(state = {}) {
  const slides = Array.isArray(state.slides) ? state.slides : [];
  const firstSlideWithTopCta = Array.isArray(slides)
    ? slides.find(
        (slide) =>
          slide &&
          (slide.showAllProjectsCta !== undefined ||
            hasOwnValue(slide, "allProjectsText") ||
            slide.allProjectsActionType ||
            hasOwnValue(slide, "allProjectsUrl") ||
            Array.isArray(slide.allProjectsActionSet)),
      )
    : null;

  return {
    showAllProjectsCta:
      firstSlideWithTopCta?.showAllProjectsCta ??
      state.showAllProjectsCta ??
      true,
    allProjectsActionType:
      firstSlideWithTopCta?.allProjectsActionType ||
      state.allProjectsActionType ||
      "trigger",
    allProjectsUrl: getStringValue(
      firstSlideWithTopCta?.allProjectsUrl,
      getStringValue(state.allProjectsUrl, ""),
    ),
    allProjectsActionSet: Array.isArray(
      firstSlideWithTopCta?.allProjectsActionSet,
    )
      ? firstSlideWithTopCta.allProjectsActionSet
      : Array.isArray(state.allProjectsActionSet)
        ? state.allProjectsActionSet
        : [],
  };
}

function normalizeSlide(slide = {}, sharedState = {}, legacyTopCtaState = {}) {
  const allProjectsTextCleared = Boolean(slide.allProjectsTextCleared);
  const exploreTextCleared = Boolean(slide.exploreTextCleared);
  const hasCustomBadgeColors =
    slide.hasCustomBadgeColors ?? sharedState.hasCustomBadgeColors ?? false;
  const hasCustomTextColors =
    slide.hasCustomTextColors ?? sharedState.hasCustomTextColors ?? false;

  return {
    id: slide.id || getUniqueId(),
    client: getStringValue(slide.client, ""),
    headline: getStringValue(slide.headline, ""),
    body: getStringValue(slide.body, ""),
    image: getStringValue(slide.image, ""),
    bgColor: slide.bgColor || "#ffffff",
    textColor: slide.textColor || "#000000",
    hasCustomBadgeColors,
    badgeFillColor: getStringValue(
      slide.badgeFillColor,
      getStringValue(sharedState.badgeFillColor, "#ffffff"),
    ),
    badgeBorderColor: getStringValue(
      slide.badgeBorderColor,
      getStringValue(sharedState.badgeBorderColor, "#ffffff"),
    ),
    badgeTextColor: getStringValue(
      slide.badgeTextColor,
      getStringValue(sharedState.badgeTextColor, "#000000"),
    ),
    hasCustomTextColors,
    hasCustomHeadlineColor: Boolean(
      slide.hasCustomHeadlineColor ?? slide.hasCustomTextColors,
    ),
    headlineTextColor: getStringValue(
      slide.headlineTextColor,
      getStringValue(sharedState.headlineTextColor, "#ffffff"),
    ),
    hasCustomBodyColor: Boolean(
      slide.hasCustomBodyColor ?? slide.hasCustomTextColors,
    ),
    bodyTextColor: getStringValue(
      slide.bodyTextColor,
      getStringValue(sharedState.bodyTextColor, "#ffffff"),
    ),
    hasCustomBadgeTypography: Boolean(slide.hasCustomBadgeTypography),
    ...normalizeTypographyEntity(slide, "badge", {
      defaultWeight: 700,
      isSlide: true,
    }),
    hasCustomHeadlineTypography: Boolean(slide.hasCustomHeadlineTypography),
    ...normalizeTypographyEntity(slide, "headline", {
      defaultWeight: 400,
      isSlide: true,
    }),
    hasCustomBodyTypography: Boolean(slide.hasCustomBodyTypography),
    ...normalizeTypographyEntity(slide, "body", {
      defaultWeight: 400,
      isSlide: true,
    }),
    allProjectsText: allProjectsTextCleared
      ? ""
      : getStringValue(slide.allProjectsText, ""),
    allProjectsTextCleared,
    showAllProjectsCta:
      slide.showAllProjectsCta ??
      sharedState.showAllProjectsCta ??
      legacyTopCtaState.showAllProjectsCta ??
      true,
    allProjectsHasSuffixIcon: slide.allProjectsHasSuffixIcon ?? true,
    allProjectsSuffixIcon:
      normalizeSvgMarkup(
        getStringValue(
          slide.allProjectsSuffixIcon,
          DEFAULT_TOP_CTA_SUFFIX_ICON,
        ),
      ) || DEFAULT_TOP_CTA_SUFFIX_ICON,
    allProjectsSuffixIconColor: getStringValue(
      slide.allProjectsSuffixIconColor,
      "",
    ),
    allProjectsActionType:
      slide.allProjectsActionType ||
      sharedState.allProjectsActionType ||
      legacyTopCtaState.allProjectsActionType ||
      "trigger",
    allProjectsUrl: getStringValue(
      slide.allProjectsUrl,
      getStringValue(
        sharedState.allProjectsUrl,
        getStringValue(legacyTopCtaState.allProjectsUrl, ""),
      ),
    ),
    allProjectsActionSet: Array.isArray(slide.allProjectsActionSet)
      ? slide.allProjectsActionSet
      : Array.isArray(sharedState.allProjectsActionSet)
        ? sharedState.allProjectsActionSet
        : Array.isArray(legacyTopCtaState.allProjectsActionSet)
          ? legacyTopCtaState.allProjectsActionSet
          : [],
    showExploreCta: slide.showExploreCta !== false,
    exploreText: exploreTextCleared
      ? ""
      : getStringValue(slide.exploreText, ""),
    exploreTextCleared,
    exploreHasSuffixIcon: Boolean(slide.exploreHasSuffixIcon),
    exploreSuffixIcon: normalizeSvgMarkup(
      getStringValue(slide.exploreSuffixIcon, ""),
    ),
    exploreSuffixIconColor: getStringValue(slide.exploreSuffixIconColor, ""),
    exploreActionType: slide.exploreActionType || "trigger",
    exploreUrl: getStringValue(slide.exploreUrl, ""),
    exploreActionSet: Array.isArray(slide.exploreActionSet)
      ? slide.exploreActionSet
      : [],
    allProjectsButtonShape: normalizeButtonShape(
      slide.allProjectsButtonShape,
      "flat",
    ),
    exploreButtonShape: normalizeButtonShape(
      slide.exploreButtonShape,
      "outlined-pill",
    ),
  };
}

function normalizeSlides(slides, sharedState, legacyTopCtaState) {
  const sourceSlides =
    Array.isArray(slides) && slides.length ? slides : DEFAULT_SLIDES;

  return sourceSlides.map((slide) =>
    normalizeSlide(slide, sharedState, legacyTopCtaState),
  );
}

function normalizeBadgeShape(badgeShape) {
  if (badgeShape === "pill") return "outlined-pill";
  if (badgeShape === "rounded") return "outlined-rounded";
  if (badgeShape === "square") return "outlined-square";

  const allowedBadgeShapes = [
    "flat",
    "filled-pill",
    "filled-rounded",
    "filled-square",
    "outlined-pill",
    "outlined-rounded",
    "outlined-square",
  ];

  return allowedBadgeShapes.includes(badgeShape) ? badgeShape : "outlined-pill";
}

function normalizeBadgeTextTransform() {
  return "none";
}

function normalizeButtonShape(shape, fallback) {
  const allowedButtonShapes = [
    "flat",
    "filled-pill",
    "filled-rounded",
    "filled-square",
    "outlined-pill",
    "outlined-rounded",
    "outlined-square",
  ];
  return allowedButtonShapes.includes(shape) ? shape : fallback;
}

function normalizeFontWeight(value, fallback) {
  const nextValue = getNumberValue(value, fallback);
  return Math.min(900, Math.max(100, nextValue));
}

function normalizeTypographySize(value) {
  return getOptionalNumberValue(value);
}

function normalizeLineHeight(value) {
  return getOptionalNumberValue(value);
}

function normalizeTypographyEntity(
  src,
  prefix,
  { defaultWeight, isSlide = false },
) {
  const fontKey = `${prefix}Font`;
  const weightKey = `${prefix}FontWeight`;
  const sizeKey = `${prefix}FontSize`;
  const lineHeightKey = `${prefix}LineHeight`;

  const weight = isSlide
    ? src[weightKey] === undefined
      ? undefined
      : normalizeFontWeight(src[weightKey], defaultWeight)
    : normalizeFontWeight(src[weightKey], defaultWeight);

  const result = {
    [fontKey]: getStringValue(src[fontKey], ""),
    [weightKey]: weight,
    [sizeKey]: normalizeTypographySize(src[sizeKey]),
  };

  if (isSlide) {
    result[lineHeightKey] = normalizeLineHeight(src[lineHeightKey]);
  }

  return result;
}

export function getInitialState(state) {
  const nextState = state || {};
  const legacyTopCtaState = getLegacyTopCtaState(nextState);
  const widthBreakpoint = getNumberValue(nextState.widthBreakpoint, 900);
  const currentComponentWidth = getNumberValue(
    nextState.currentComponentWidth,
    0,
  );
  const defaultFont = getStringValue(nextState.font, "Poppins, sans-serif");

  return {
    font: defaultFont,
    imageBorderRadius: 24,
    imageAspectRatio: "natural",
    exploreText: "Explore project",
    autoPlayEnabled: false,
    autoPlayInterval: 5000,
    pauseOnHover: true,
    manualAutoPlayPaused: false,
    slideAnimation: "fadeUp",
    slideDirection: "left",
    showIndicators: true,
    indicatorStyle: "dots",
    indicatorSize: 10,
    indicatorColor: "",
    showArrowButtons: true,
    arrowColor: "",
    hasCustomBadgeColors: false,
    badgeFillColor: "#ffffff",
    badgeBorderColor: "#ffffff",
    badgeTextColor: "#000000",
    hasCustomTextColors: false,
    headlineTextColor: "#ffffff",
    bodyTextColor: "#ffffff",
    hasWidthBreakpoint: false,
    previewWidthInLiveView: false,
    currentSlideIndex: 0,
    isAutoPlaying: false,
    exploreClicked: false,
    allProjectsClicked: false,
    slideChanges: 0,
    ...nextState,
    widthBreakpoint,
    currentComponentWidth,
    badgeFont: getStringValue(nextState.badgeFont, defaultFont),
    badgeFontWeight: normalizeFontWeight(nextState.badgeFontWeight, 700),
    badgeFontSize: normalizeTypographySize(nextState.badgeFontSize),
    headlineFont: getStringValue(nextState.headlineFont, defaultFont),
    headlineFontWeight: normalizeFontWeight(nextState.headlineFontWeight, 400),
    headlineFontSize: normalizeTypographySize(nextState.headlineFontSize),
    bodyFont: getStringValue(nextState.bodyFont, defaultFont),
    bodyFontWeight: normalizeFontWeight(nextState.bodyFontWeight, 400),
    bodyFontSize: normalizeTypographySize(nextState.bodyFontSize),
    badgeShape: normalizeBadgeShape(nextState.badgeShape),
    badgeTextTransform: normalizeBadgeTextTransform(
      nextState.badgeTextTransform,
    ),
    slides: normalizeSlides(nextState.slides, nextState, legacyTopCtaState),
  };
}
```

END

FILE: /editor/index.js

```javascript
import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Checkbox,
  Dropdown,
  ActionSet,
  Tabs,
  Tab,
  Section,
  SettingItem,
  Label,
  TableContainer,
  OptionsMenuRootButton,
  Drawer,
  DrawerSection,
  ColorPicker,
  ImagePicker,
  FontSelector,
  SvgPicker,
} from "@ui";
import { editIcon, deleteIcon, duplicateIcon } from "@icons";
import { SizeType } from "@constants";
import { getUniqueId, ScopedStyle } from "@utils";
import { getInitialState, normalizeSvgMarkup } from "@common/index";
export { getInitialState };

const DEFAULT_TOP_CTA_SUFFIX_ICON =
  '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const indicatorStyleOptions = [
  { value: "dots", text: "Dots" },
  { value: "numbers", text: "Numbers" },
  { value: "bars", text: "Bars" },
  { value: "barDots", text: "Morph" },
];

const slideAnimationOptions = [
  { value: "fade", text: "Fade" },
  { value: "slideLeft", text: "Slide" },
  { value: "zoom", text: "Zoom" },
  { value: "none", text: "None" },
];

const fontWeightOptions = [
  { value: 100, text: "Thin (100)" },
  { value: 200, text: "Extra Light (200)" },
  { value: 300, text: "Light (300)" },
  { value: 400, text: "Regular (400)" },
  { value: 500, text: "Medium (500)" },
  { value: 600, text: "Semi Bold (600)" },
  { value: 700, text: "Bold (700)" },
  { value: 800, text: "Extra Bold (800)" },
  { value: 900, text: "Black (900)" },
];

const slideDirectionOptions = [
  { value: "left", text: "Left" },
  { value: "right", text: "Right" },
  { value: "up", text: "Up" },
  { value: "down", text: "Down" },
];

const badgeShapeOptions = [
  { value: "flat", text: "Flat" },
  { value: "filled-pill", text: "Pill" },
  { value: "filled-rounded", text: "Rounded" },
  { value: "filled-square", text: "Square" },
  { value: "outlined-pill", text: "Outlined Pill" },
  { value: "outlined-rounded", text: "Outlined Rounded" },
  { value: "outlined-square", text: "Outlined Square" },
];

const ctaActionOptions = [
  { value: "url", text: "URL" },
  { value: "trigger", text: "Action Set" },
];

const textareaStyle = {
  width: "100%",
  resize: "vertical",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  border: "1px solid #999",
  color: "#595959",
  padding: "7px 10px",
  fontSize: "14px",
  fontFamily: "Poppins, Open Sans, sans-serif",
  fontWeight: 300,
};

const drawerSectionHeadingStyle = {
  margin: "0 0 12px 0",
  color: "#000000",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  lineHeight: 1.2,
  textTransform: "uppercase",
};

const drawerSubsectionHeadingStyle = {
  margin: "16px 0 8px",
  paddingTop: "16px",
  color: "#000000",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  lineHeight: 1.2,
  textTransform: "uppercase",
  borderTop: "1px solid #e5e7eb",
};

const slideTypographyConfig = {
  badge: {
    enabledKey: "hasCustomBadgeTypography",
    fontKey: "badgeFont",
    weightKey: "badgeFontWeight",
    sizeKey: "badgeFontSize",
    lineHeightKey: "badgeLineHeight",
    colorKey: "badgeTextColor",
    fillColorKey: "badgeFillColor",
    fallbackWeight: 700,
    fallbackSize: 11,
    fallbackLineHeight: 1.2,
  },
  headline: {
    enabledKey: "hasCustomHeadlineTypography",
    fontKey: "headlineFont",
    weightKey: "headlineFontWeight",
    sizeKey: "headlineFontSize",
    lineHeightKey: "headlineLineHeight",
    colorKey: "headlineTextColor",
    fallbackWeight: 400,
    fallbackSize: 64,
    fallbackLineHeight: 1.15,
  },
  body: {
    enabledKey: "hasCustomBodyTypography",
    fontKey: "bodyFont",
    weightKey: "bodyFontWeight",
    sizeKey: "bodyFontSize",
    lineHeightKey: "bodyLineHeight",
    colorKey: "bodyTextColor",
    fallbackWeight: 400,
    fallbackSize: 18,
    fallbackLineHeight: 1.6,
  },
};

const settingsStyles = `
  .css-slider-settings-section-heading {
    margin: 0 0 12px 0;
    color: #000000;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .css-slider-settings-subsection-heading {
    margin: 16px 0;
    padding-top: 16px;
    color: #000000;
    font-size: 14px;
    letter-spacing: 0.02em;
    font-weight: 700;
    line-height: 1.2;
    text-transform: capitalize;
  }

  .css-slider-drag-cell {
    padding-left: 12px;
  }

  .css-slider-drag-handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    cursor: grab;
    user-select: none;
    appearance: none;
    -webkit-appearance: none;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .css-slider-drag-handle:active {
    cursor: grabbing;
  }

  .css-slider-drag-handle svg {
    width: 18px;
    height: 18px;
    display: block;
    pointer-events: none;
  }

  .css-slider-table-headline-cell {
    flex: 1 1 0;
    max-width: 200px;
    min-width: 0;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 8px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .css-slider-table-headline-cell.is-drop-target {
    border-color: #f57b37;
    background: rgba(245, 123, 55, 0.08);
  }

  .css-slider-table-headline {
    display: block;
    width: 100%;
    min-width: 0;
    color: #111827;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .css-slider-table-color-cell {
    padding: 0 4px;
  }
`;

function SvgColorField({ svgValue, colorValue, onSvgChange, onColorChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <SvgPicker value={svgValue} onChange={onSvgChange} />
      <ColorPicker value={colorValue || ""} onChange={onColorChange} />
    </div>
  );
}

function CtaSettings({
  actionLabel,
  actionSetHelp,
  actionSetValue,
  actionType,
  hasSuffixIcon,
  hideToggle,
  isVisible,
  onActionSetChange,
  onActionTypeChange,
  onSuffixIconChange,
  onSuffixIconColorChange,
  onToggleSuffixIcon,
  onTextChange,
  onToggleVisibility,
  onUrlChange,
  suffixIconColor,
  suffixIconValue,
  textLabel,
  textValue,
  toggleLabel,
  toggleHelp,
  urlValue,
}) {
  return (
    <>
      {!hideToggle ? (
        <>
          <SettingItem>
            <Label content={toggleLabel} help={toggleHelp} />
          </SettingItem>
          <SettingItem>
            <Checkbox
              label={`Show ${toggleLabel.toLowerCase()}`}
              value={Boolean(isVisible)}
              onChange={onToggleVisibility}
            />
          </SettingItem>
        </>
      ) : null}
      {isVisible ? (
        <>
          {typeof textValue === "string" && onTextChange ? (
            <SettingItem>
              <Label content={textLabel} />
              <TextInput
                value={textValue}
                onChange={(e) => onTextChange(e.currentTarget.value)}
              />
            </SettingItem>
          ) : null}
          <SettingItem>
            <Label
              content="Suffix icon"
              help="Enable an optional icon after the CTA label. Pick an SVG that should inherit the current button color."
            />
          </SettingItem>
          <SettingItem>
            <Checkbox
              label="Show suffix icon"
              value={Boolean(hasSuffixIcon)}
              onChange={onToggleSuffixIcon}
            />
          </SettingItem>
          {hasSuffixIcon ? (
            <SettingItem>
              <Label
                content="Suffix Icon"
                help="Pick an icon and optionally set its color. Leave color unset to inherit the button's text color."
              />
              <SvgColorField
                colorValue={suffixIconColor}
                svgValue={suffixIconValue}
                onColorChange={onSuffixIconColorChange}
                onSvgChange={(svgMarkup) =>
                  onSuffixIconChange(normalizeSvgMarkup(svgMarkup))
                }
              />
            </SettingItem>
          ) : null}
          <SettingItem>
            <Label
              content={actionLabel}
              help="Choose whether this CTA opens a URL in a new tab or runs an ActionSet directly."
            />
            <Dropdown
              options={ctaActionOptions}
              value={actionType}
              onChange={onActionTypeChange}
            />
          </SettingItem>
          {actionType === "url" ? (
            <SettingItem>
              <Label
                content="CTA URL"
                help="Enter the destination URL. This CTA always opens it in a new browser tab."
              />
              <TextInput
                value={urlValue}
                onChange={(e) => onUrlChange(e.currentTarget.value)}
              />
            </SettingItem>
          ) : (
            <SettingItem>
              <Label content="Action Set" help={actionSetHelp} />
              <ActionSet
                value={actionSetValue}
                onChange={(actionSet) =>
                  onActionSetChange(Array.isArray(actionSet) ? actionSet : [])
                }
              />
            </SettingItem>
          )}
        </>
      ) : null}
    </>
  );
}

function GlobalTypographyGroup({
  config,
  label,
  state,
  setState,
  fontHelp,
  weightHelp,
  sizeHelp,
}) {
  return (
    <>
      <SettingItem>
        <Label content="Font" help={fontHelp} />
        <FontSelector
          value={state[config.fontKey] || state.font}
          onChange={(value) =>
            setState((prev) => ({ ...prev, [config.fontKey]: value }))
          }
        />
      </SettingItem>
      <SettingItem>
        <Label content="Weight" help={weightHelp} />
        <Dropdown
          options={fontWeightOptions}
          value={state[config.weightKey] ?? config.fallbackWeight}
          onChange={(value) =>
            setState((prev) => ({ ...prev, [config.weightKey]: value }))
          }
        />
      </SettingItem>
      <SettingItem>
        <Label
          content="Size"
          help={
            sizeHelp ||
            `Set the font size in pixels for the ${label.toLowerCase()}. Leave empty to use the responsive default.`
          }
        />
        <NumberInput
          max={200}
          step={1}
          value={state[config.sizeKey] ?? ""}
          onChange={(value) =>
            setState((prev) => ({ ...prev, [config.sizeKey]: value }))
          }
        />
      </SettingItem>
    </>
  );
}

function DrawerSectionHeading({ children }) {
  return <div style={drawerSectionHeadingStyle}>{children}</div>;
}

function DrawerSubsectionHeading({ children }) {
  return <div style={drawerSubsectionHeadingStyle}>{children}</div>;
}

function buildSlideTypographyToggleUpdates(slide, state, config, isEnabled) {
  if (!isEnabled) {
    return { [config.enabledKey]: false };
  }

  return {
    [config.enabledKey]: true,
    [config.fontKey]:
      slide?.[config.fontKey] || state[config.fontKey] || state.font || "",
    [config.weightKey]:
      slide?.[config.weightKey] ??
      state[config.weightKey] ??
      config.fallbackWeight,
    [config.sizeKey]: slide?.[config.sizeKey] ?? config.fallbackSize,
    [config.lineHeightKey]:
      slide?.[config.lineHeightKey] ?? config.fallbackLineHeight,
  };
}

function SlideTypographySettings({
  colorValue,
  fontValue,
  isEnabled,
  lineHeightValue,
  onColorChange,
  onFontChange,
  onLineHeightChange,
  onSizeChange,
  onToggle,
  onWeightChange,
  sizeValue,
  weightValue,
}) {
  return (
    <>
      <SettingItem>
        <Checkbox
          label="Custom typography"
          value={Boolean(isEnabled)}
          onChange={onToggle}
        />
      </SettingItem>
      {isEnabled ? (
        <>
          <SettingItem>
            <Label content="Font" />
            <FontSelector value={fontValue} onChange={onFontChange} />
          </SettingItem>
          <SettingItem>
            <Label content="Weight" />
            <Dropdown
              options={fontWeightOptions}
              value={weightValue}
              onChange={onWeightChange}
            />
          </SettingItem>
          <SettingItem>
            <Label content="Size" />
            <NumberInput
              max={200}
              step={1}
              value={sizeValue}
              onChange={onSizeChange}
            />
          </SettingItem>
          <SettingItem>
            <Label content="Line height" />
            <NumberInput
              max={3}
              min={0.5}
              step={0.05}
              value={lineHeightValue}
              onChange={onLineHeightChange}
            />
          </SettingItem>
          {onColorChange ? (
            <SettingItem>
              <Label content="Color" />
              <ColorPicker
                value={colorValue || "#ffffff"}
                onChange={onColorChange}
              />
            </SettingItem>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function Settings({ state, setState }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  const slides = Array.isArray(state.slides) ? state.slides : [];
  const activeSlide = editingId
    ? slides.find((slide) => slide.id === editingId)
    : null;

  const badgeTypographyDefaults = slideTypographyConfig.badge;
  const headlineTypographyDefaults = slideTypographyConfig.headline;
  const bodyTypographyDefaults = slideTypographyConfig.body;

  const openDrawer = (slideId) => {
    setEditingId(slideId);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: getUniqueId(),
      client: "Client Name",
      headline: "Lorem ipsum dolor sit amet consectetur",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: "https://placehold.co/1200x600/cccccc/000000?text=New+Slide",
      bgColor: "#ffffff",
      textColor: "#000000",
      allProjectsText: "View all projects",
      allProjectsTextCleared: false,
      showAllProjectsCta: true,
      allProjectsHasSuffixIcon: true,
      allProjectsSuffixIcon: DEFAULT_TOP_CTA_SUFFIX_ICON,
      allProjectsActionType: "trigger",
      allProjectsUrl: "",
      allProjectsActionSet: [],
      showExploreCta: true,
      exploreText: "Explore project",
      exploreTextCleared: false,
      exploreHasSuffixIcon: false,
      exploreSuffixIcon: "",
      exploreActionType: "trigger",
      exploreUrl: "",
      exploreActionSet: [],
    };

    setState((prev) => ({
      ...prev,
      slides: [...(prev.slides || []), newSlide],
    }));
    openDrawer(newSlide.id);
  };

  const handleEditSlide = (slideId) => {
    openDrawer(slideId);
  };

  const updateSlide = (slideId, updates) => {
    setState((prev) => ({
      ...prev,
      slides: (prev.slides || []).map((slide) =>
        slide.id === slideId ? { ...slide, ...updates } : slide,
      ),
    }));
  };

  const updateEditingSlide = (updates) => {
    if (!editingId) return;
    updateSlide(editingId, updates);
  };

  const handleDuplicateSlide = (slideId) => {
    setState((prev) => {
      const nextSlides = [...(prev.slides || [])];
      const sourceIndex = nextSlides.findIndex((slide) => slide.id === slideId);

      if (sourceIndex === -1) {
        return prev;
      }

      const duplicateSlide = {
        ...nextSlides[sourceIndex],
        id: getUniqueId(),
      };

      nextSlides.splice(sourceIndex + 1, 0, duplicateSlide);
      return { ...prev, slides: nextSlides };
    });
  };

  const handleDeleteSlide = (slideId) => {
    if (editingId === slideId) {
      closeDrawer();
    }

    setState((prev) => ({
      ...prev,
      slides: (prev.slides || []).filter((slide) => slide.id !== slideId),
    }));
  };

  const moveSlide = (items, fromId, toId) => {
    const fromIndex = items.findIndex((item) => item.id === fromId);
    const toIndex = items.findIndex((item) => item.id === toId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return items;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    return nextItems;
  };

  const handleDragStart = (slideId) => (event) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", slideId);
    setDraggedId(slideId);
  };

  const handleDragOver = (slideId) => (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (slideId !== dropTargetId) {
      setDropTargetId(slideId);
    }
  };

  const handleDrop = (slideId) => (event) => {
    event.preventDefault();

    const sourceId = event.dataTransfer.getData("text/plain") || draggedId;

    if (!sourceId || sourceId === slideId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    setState((prev) => ({
      ...prev,
      slides: moveSlide(prev.slides || [], sourceId, slideId),
    }));

    setDraggedId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
  };

  return (
    <>
      <ScopedStyle>{settingsStyles}</ScopedStyle>
      <Tabs defaultActiveTab="slides">
        <Tab id="slides" title="Slides">
          <Section>
            <TableContainer
              addButtonText="Add Slide"
              addButtonTitle="Add a new slide to the carousel"
              columns={[
                { content: "", compact: true },
                { content: "Headline" },
                { content: "Bg", compact: true },
                { content: "", compact: true },
              ]}
              emptyMessage="No slides configured."
              rows={slides.map((slide) => [
                <div className="css-slider-drag-cell" key={`drag-${slide.id}`}>
                  <button
                    draggable
                    className="css-slider-drag-handle"
                    title="Drag to reorder"
                    type="button"
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver(slide.id)}
                    onDragStart={handleDragStart(slide.id)}
                    onDrop={handleDrop(slide.id)}
                  >
                    <svg
                      fill="#111827"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z" />
                    </svg>
                  </button>
                </div>,
                <div
                  className={`css-slider-table-headline-cell${dropTargetId === slide.id ? " is-drop-target" : ""}`}
                  key={`headline-${slide.id}`}
                  onDragOver={handleDragOver(slide.id)}
                  onDrop={handleDrop(slide.id)}
                >
                  <div className="css-slider-table-headline">
                    {slide.headline || "Add a headline"}
                  </div>
                </div>,
                <div
                  className="css-slider-table-color-cell"
                  key={`bg-${slide.id}`}
                >
                  <ColorPicker
                    value={slide.bgColor || "#ffffff"}
                    onChange={(bgColor) => updateSlide(slide.id, { bgColor })}
                  />
                </div>,
                <OptionsMenuRootButton
                  key={`menu-${slide.id}`}
                  options={[
                    {
                      text: "Edit",
                      tip: "Edit slide contents",
                      icon: editIcon,
                      type: "onClick",
                      onClick: () => handleEditSlide(slide.id),
                    },
                    {
                      text: "Duplicate",
                      tip: "Duplicate this slide",
                      icon: duplicateIcon,
                      type: "onClick",
                      onClick: () => handleDuplicateSlide(slide.id),
                    },
                    {
                      text: "Delete",
                      tip: "Delete this slide",
                      icon: deleteIcon,
                      type: "onClick",
                      onClick: () => handleDeleteSlide(slide.id),
                    },
                  ]}
                />,
              ])}
              onAdd={handleAddSlide}
            />
          </Section>

          <Section>
            <div className="css-slider-settings-section-heading">
              indicators
            </div>
            <SettingItem>
              <Label
                content="Display"
                help="Control whether slide indicators appear, which visual style they use, and how large they render in the live component."
              />
            </SettingItem>
            <SettingItem>
              <Checkbox
                label="Show indicators"
                value={Boolean(state.showIndicators)}
                onChange={(showIndicators) =>
                  setState((prev) => ({ ...prev, showIndicators }))
                }
              />
            </SettingItem>
            {state.showIndicators ? (
              <>
                <SettingItem>
                  <Label
                    content="Indicator style"
                    help="Choose between dots, numbers, bars, or the morphing bar-dot style."
                  />
                  <Dropdown
                    options={indicatorStyleOptions}
                    value={state.indicatorStyle}
                    onChange={(indicatorStyle) =>
                      setState((prev) => ({ ...prev, indicatorStyle }))
                    }
                  />
                </SettingItem>
                <SettingItem>
                  <Label
                    content="Indicator size"
                    help="Adjust the size of dots, bars, or number markers."
                  />
                  <NumberInput
                    max={24}
                    min={6}
                    step={1}
                    value={state.indicatorSize}
                    onChange={(indicatorSize) =>
                      setState((prev) => ({ ...prev, indicatorSize }))
                    }
                  />
                </SettingItem>
              </>
            ) : null}
          </Section>

          <Section>
            <div className="css-slider-settings-section-heading">
              navigation
            </div>
            <SettingItem>
              <Label
                content="Arrows"
                help="Show or hide the previous and next arrow controls without changing the current slide behavior."
              />
            </SettingItem>
            <SettingItem>
              <Checkbox
                label="Show arrows"
                value={Boolean(state.showArrowButtons)}
                onChange={(showArrowButtons) =>
                  setState((prev) => ({ ...prev, showArrowButtons }))
                }
              />
            </SettingItem>
          </Section>
        </Tab>
        <Tab id="styles" title="Global styles">
          <Section>
            <div className="css-slider-settings-section-heading">badge</div>
            <div className="css-slider-settings-subsection-heading">type</div>
            <GlobalTypographyGroup
              config={slideTypographyConfig.badge}
              fontHelp="Choose the font family used by the client badge across all slides."
              label="badge"
              setState={setState}
              sizeHelp="Set the font size in pixels for the client badge. Leave empty to use the default."
              state={state}
              weightHelp="Choose the font weight for the client badge."
            />
            <SettingItem>
              <Label
                content="Shape"
                help="Choose one shared style for the client badge across every slide, including flat, filled, and outlined shapes."
              />
              <Dropdown
                options={badgeShapeOptions}
                value={state.badgeShape || "outlined-pill"}
                onChange={(badgeShape) =>
                  setState((prev) => ({ ...prev, badgeShape }))
                }
              />
            </SettingItem>
            <div className="css-slider-settings-subsection-heading">colors</div>
            <SettingItem>
              <Label
                content="Font color"
                help="Default font color for badge text across all slides. Can be overridden per slide."
              />
              <ColorPicker
                value={state.badgeTextColor || "#000000"}
                onChange={(badgeTextColor) =>
                  setState((prev) => ({ ...prev, badgeTextColor }))
                }
              />
            </SettingItem>
            <SettingItem>
              <Label
                content="Background"
                help="Default background fill color for badges across all slides. Used by filled shapes; for outlined shapes this sets the fill. Can be overridden per slide."
              />
              <ColorPicker
                value={state.badgeFillColor || "#ffffff"}
                onChange={(badgeFillColor) =>
                  setState((prev) => ({ ...prev, badgeFillColor }))
                }
              />
            </SettingItem>
          </Section>

          <Section>
            <div className="css-slider-settings-section-heading">headline</div>
            <GlobalTypographyGroup
              config={slideTypographyConfig.headline}
              fontHelp="Choose the font family used by the main headline across all slides."
              label="headline"
              setState={setState}
              sizeHelp="Set the font size in pixels for the headline. Leave empty to use the responsive default."
              state={state}
              weightHelp="Choose the font weight for the main headline."
            />
            <SettingItem>
              <Label
                content="Color"
                help="Default headline text color across all slides. Can be overridden per slide."
              />
              <ColorPicker
                value={state.headlineTextColor || "#ffffff"}
                onChange={(headlineTextColor) =>
                  setState((prev) => ({ ...prev, headlineTextColor }))
                }
              />
            </SettingItem>
          </Section>

          <Section>
            <div className="css-slider-settings-section-heading">body</div>
            <GlobalTypographyGroup
              config={slideTypographyConfig.body}
              fontHelp="Choose the font family used by the body copy, top CTA, and body CTA across all slides."
              label="body"
              setState={setState}
              sizeHelp="Set the font size in pixels for the body copy. Leave empty to use the responsive default."
              state={state}
              weightHelp="Choose the font weight for the body copy and CTAs."
            />
            <SettingItem>
              <Label
                content="Color"
                help="Default body text color across all slides. Can be overridden per slide."
              />
              <ColorPicker
                value={state.bodyTextColor || "#ffffff"}
                onChange={(bodyTextColor) =>
                  setState((prev) => ({ ...prev, bodyTextColor }))
                }
              />
            </SettingItem>
          </Section>

          <Section>
            <div className="css-slider-settings-section-heading">image</div>
            <SettingItem>
              <Label
                content="Border radius"
                help="Adjust the corner rounding used for the main slide image on every slide."
              />
              <NumberInput
                max={120}
                min={0}
                step={1}
                value={state.imageBorderRadius ?? 24}
                onChange={(imageBorderRadius) =>
                  setState((prev) => ({ ...prev, imageBorderRadius }))
                }
              />
            </SettingItem>
            <SettingItem>
              <Label
                content="Aspect ratio"
                help="Control the shape of the image area. 'Natural' uses the image's own dimensions. Other options crop to a fixed ratio so images stay consistent across slides."
              />
              <Dropdown
                options={[
                  { value: "natural", text: "Natural" },
                  { value: "1/1", text: "Square (1:1)" },
                  { value: "4/3", text: "Standard (4:3)" },
                  { value: "16/9", text: "Widescreen (16:9)" },
                ]}
                value={state.imageAspectRatio || "natural"}
                onChange={(imageAspectRatio) =>
                  setState((prev) => ({ ...prev, imageAspectRatio }))
                }
              />
            </SettingItem>
          </Section>

          <Section>
            <div className="css-slider-settings-section-heading">
              navigation
            </div>
            <SettingItem>
              <Label
                content="Arrow color"
                help="Choose the color used for the previous and next arrow buttons."
              />
              <ColorPicker
                value={state.arrowColor || "#ffffff"}
                onChange={(arrowColor) =>
                  setState((prev) => ({ ...prev, arrowColor }))
                }
              />
            </SettingItem>
          </Section>

          <Section>
            <div className="css-slider-settings-section-heading">
              indicators
            </div>
            <SettingItem>
              <Label
                content="Indicator color"
                help="Choose the color used for the slide indicator dots, bars, or numbers."
              />
              <ColorPicker
                value={state.indicatorColor || "#ffffff"}
                onChange={(indicatorColor) =>
                  setState((prev) => ({ ...prev, indicatorColor }))
                }
              />
            </SettingItem>
          </Section>
        </Tab>

        <Tab id="behavior" title="Behavior">
          <Section>
            <div className="css-slider-settings-section-heading">
              transitions
            </div>
            <SettingItem>
              <Label
                content="Slide animation"
                help="Choose the transition used when a new slide becomes active in the live component. Slide uses the selected direction and does not fade."
              />
              <Dropdown
                options={slideAnimationOptions}
                value={
                  state.slideAnimation === "fadeUp"
                    ? "fade"
                    : state.slideAnimation || "fade"
                }
                onChange={(slideAnimation) =>
                  setState((prev) => ({ ...prev, slideAnimation }))
                }
              />
            </SettingItem>
            {(state.slideAnimation || "fade") === "slideLeft" ? (
              <SettingItem>
                <Label
                  content="Slide direction"
                  help="Choose the direction the motion-based transition should come from when a new slide becomes active."
                />
                <Dropdown
                  options={slideDirectionOptions}
                  value={state.slideDirection || "left"}
                  onChange={(slideDirection) =>
                    setState((prev) => ({ ...prev, slideDirection }))
                  }
                />
              </SettingItem>
            ) : null}
          </Section>

          <Section>
            <div className="css-slider-settings-section-heading">auto-play</div>
            <SettingItem>
              <Label
                content="Auto-Play"
                help="Enable automatic slide rotation and configure how it pauses on hover."
              />
            </SettingItem>
            <SettingItem>
              <Checkbox
                label="Enable auto-play"
                value={Boolean(state.autoPlayEnabled)}
                onChange={(autoPlayEnabled) =>
                  setState((prev) => ({ ...prev, autoPlayEnabled }))
                }
              />
            </SettingItem>
            {state.autoPlayEnabled ? (
              <>
                <SettingItem>
                  <Label
                    content="Interval (ms)"
                    help="Choose how often the slider advances while auto-play is enabled."
                  />
                  <NumberInput
                    max={10000}
                    min={2000}
                    step={500}
                    value={state.autoPlayInterval}
                    onChange={(autoPlayInterval) =>
                      setState((prev) => ({ ...prev, autoPlayInterval }))
                    }
                  />
                </SettingItem>
                <SettingItem>
                  <Checkbox
                    label="Pause on hover"
                    value={Boolean(state.pauseOnHover)}
                    onChange={(pauseOnHover) =>
                      setState((prev) => ({ ...prev, pauseOnHover }))
                    }
                  />
                </SettingItem>
              </>
            ) : null}
          </Section>
        </Tab>

        <Tab id="advanced" title="Advanced">
          <Section>
            <div className="css-slider-settings-section-heading">
              responsive width
            </div>
            <SettingItem>
              <Checkbox
                label="Enable width breakpoint"
                value={Boolean(state.hasWidthBreakpoint)}
                onChange={(hasWidthBreakpoint) =>
                  setState((prev) => ({ ...prev, hasWidthBreakpoint }))
                }
              />
            </SettingItem>
            {state.hasWidthBreakpoint ? (
              <>
                <SettingItem>
                  <Label
                    content="Breakpoint width"
                    help="When the component width is at or below this value, the layout stacks and the compact header arrangement is used."
                  />
                  <NumberInput
                    max={2000}
                    min={120}
                    step={1}
                    value={state.widthBreakpoint ?? 900}
                    onChange={(widthBreakpoint) =>
                      setState((prev) => ({ ...prev, widthBreakpoint }))
                    }
                  />
                </SettingItem>
                <SettingItem>
                  <Checkbox
                    label="Preview current width in live view"
                    value={Boolean(state.previewWidthInLiveView)}
                    onChange={(previewWidthInLiveView) =>
                      setState((prev) => ({ ...prev, previewWidthInLiveView }))
                    }
                  />
                </SettingItem>
              </>
            ) : null}
          </Section>
        </Tab>
      </Tabs>

      <Drawer
        isOpen={drawerOpen && editingId !== null}
        title="Edit Slide"
        width={400}
        onClose={closeDrawer}
      >
        <DrawerSection>
          <DrawerSectionHeading>slide</DrawerSectionHeading>
          <SettingItem>
            <Label
              content="Image"
              help="Pick the main image displayed in this slide. Recommended minimum width: 1200px."
            />
            <ImagePicker
              value={activeSlide?.image || ""}
              onChange={(image) => updateEditingSlide({ image })}
            />
          </SettingItem>
          <SettingItem>
            <Label
              content="Background"
              help="Sets the slide background color. This also becomes the default base color used by buttons and overlays on this slide."
            />
            <ColorPicker
              value={activeSlide?.bgColor || "#ffffff"}
              onChange={(bgColor) => updateEditingSlide({ bgColor })}
            />
          </SettingItem>
          <SettingItem>
            <Label
              content="Text"
              help="Sets the default text color for this slide. Used by the headline, body copy, badge, and CTAs unless those elements have a custom color set."
            />
            <ColorPicker
              value={activeSlide?.textColor || "#000000"}
              onChange={(textColor) => updateEditingSlide({ textColor })}
            />
          </SettingItem>
        </DrawerSection>
        <DrawerSection>
          <DrawerSectionHeading>badge</DrawerSectionHeading>
          <SettingItem>
            <Label
              content="Badge"
              help="The short client or category label shown at the top of the slide."
            />
            <TextInput
              value={activeSlide?.client || ""}
              onChange={(e) =>
                updateEditingSlide({ client: e.currentTarget.value })
              }
            />
          </SettingItem>
          <DrawerSubsectionHeading>typography</DrawerSubsectionHeading>
          <SlideTypographySettings
            fontValue={activeSlide?.badgeFont || state.badgeFont || state.font}
            isEnabled={Boolean(activeSlide?.hasCustomBadgeTypography)}
            lineHeightValue={
              activeSlide?.badgeLineHeight ??
              badgeTypographyDefaults.fallbackLineHeight
            }
            sizeValue={
              activeSlide?.badgeFontSize ?? badgeTypographyDefaults.fallbackSize
            }
            weightValue={
              activeSlide?.badgeFontWeight ??
              state.badgeFontWeight ??
              badgeTypographyDefaults.fallbackWeight
            }
            onFontChange={(badgeFont) => updateEditingSlide({ badgeFont })}
            onLineHeightChange={(badgeLineHeight) =>
              updateEditingSlide({ badgeLineHeight })
            }
            onSizeChange={(badgeFontSize) =>
              updateEditingSlide({ badgeFontSize })
            }
            onToggle={(hasCustomBadgeTypography) =>
              updateEditingSlide(
                buildSlideTypographyToggleUpdates(
                  activeSlide,
                  state,
                  badgeTypographyDefaults,
                  hasCustomBadgeTypography,
                ),
              )
            }
            onWeightChange={(badgeFontWeight) =>
              updateEditingSlide({ badgeFontWeight })
            }
          />
          <DrawerSubsectionHeading>colors</DrawerSubsectionHeading>
          <SettingItem>
            <Label
              content="Custom colors"
              help="Override the badge colors for this slide only. When off, the badge inherits this slide's theme colors automatically."
            />
          </SettingItem>
          <SettingItem>
            <Checkbox
              label="Custom colors"
              value={Boolean(activeSlide?.hasCustomBadgeColors)}
              onChange={(hasCustomBadgeColors) =>
                updateEditingSlide({ hasCustomBadgeColors })
              }
            />
          </SettingItem>
          {activeSlide?.hasCustomBadgeColors ? (
            <>
              <SettingItem>
                <Label
                  content="Font color"
                  help="Override the badge font color for this slide only."
                />
                <ColorPicker
                  value={
                    activeSlide?.badgeTextColor ||
                    state.badgeTextColor ||
                    "#000000"
                  }
                  onChange={(badgeTextColor) =>
                    updateEditingSlide({ badgeTextColor })
                  }
                />
              </SettingItem>
              <SettingItem>
                <Label
                  content="Background"
                  help="Override the badge background fill color for this slide only. For outlined shapes this sets the fill."
                />
                <ColorPicker
                  value={
                    activeSlide?.badgeFillColor ||
                    state.badgeFillColor ||
                    "#ffffff"
                  }
                  onChange={(badgeFillColor) =>
                    updateEditingSlide({ badgeFillColor })
                  }
                />
              </SettingItem>
              <SettingItem>
                <Label content="Shape" />
                <Dropdown
                  options={badgeShapeOptions}
                  value={state.badgeShape || "outlined-pill"}
                  onChange={(badgeShape) =>
                    setState((prev) => ({ ...prev, badgeShape }))
                  }
                />
              </SettingItem>
            </>
          ) : null}
        </DrawerSection>
        <DrawerSection>
          <DrawerSectionHeading>headline</DrawerSectionHeading>
          <SettingItem>
            <Label
              content="Headline"
              help="The main heading for this slide. Keep it short and scannable."
            />
            <TextInput
              value={activeSlide?.headline || ""}
              onChange={(e) =>
                updateEditingSlide({ headline: e.currentTarget.value })
              }
            />
          </SettingItem>
          <DrawerSubsectionHeading>typography</DrawerSubsectionHeading>
          <SlideTypographySettings
            colorValue={
              activeSlide?.headlineTextColor ||
              state.headlineTextColor ||
              "#ffffff"
            }
            fontValue={
              activeSlide?.headlineFont || state.headlineFont || state.font
            }
            isEnabled={Boolean(activeSlide?.hasCustomHeadlineTypography)}
            lineHeightValue={
              activeSlide?.headlineLineHeight ??
              headlineTypographyDefaults.fallbackLineHeight
            }
            sizeValue={
              activeSlide?.headlineFontSize ??
              headlineTypographyDefaults.fallbackSize
            }
            weightValue={
              activeSlide?.headlineFontWeight ??
              state.headlineFontWeight ??
              headlineTypographyDefaults.fallbackWeight
            }
            onColorChange={(headlineTextColor) =>
              updateEditingSlide({ headlineTextColor })
            }
            onFontChange={(headlineFont) =>
              updateEditingSlide({ headlineFont })
            }
            onLineHeightChange={(headlineLineHeight) =>
              updateEditingSlide({ headlineLineHeight })
            }
            onSizeChange={(headlineFontSize) =>
              updateEditingSlide({ headlineFontSize })
            }
            onToggle={(hasCustomHeadlineTypography) =>
              updateEditingSlide(
                buildSlideTypographyToggleUpdates(
                  activeSlide,
                  state,
                  headlineTypographyDefaults,
                  hasCustomHeadlineTypography,
                ),
              )
            }
            onWeightChange={(headlineFontWeight) =>
              updateEditingSlide({ headlineFontWeight })
            }
          />
        </DrawerSection>
        <DrawerSection>
          <DrawerSectionHeading>body</DrawerSectionHeading>
          <SettingItem>
            <Label
              content="Body"
              help="Supporting copy shown below the headline. Aim for 1–3 sentences."
            />
            <textarea
              rows={5}
              style={textareaStyle}
              value={activeSlide?.body || ""}
              onChange={(e) =>
                updateEditingSlide({ body: e.currentTarget.value })
              }
            />
          </SettingItem>
          <DrawerSubsectionHeading>typography</DrawerSubsectionHeading>
          <SlideTypographySettings
            colorValue={
              activeSlide?.bodyTextColor || state.bodyTextColor || "#ffffff"
            }
            fontValue={activeSlide?.bodyFont || state.bodyFont || state.font}
            isEnabled={Boolean(activeSlide?.hasCustomBodyTypography)}
            lineHeightValue={
              activeSlide?.bodyLineHeight ??
              bodyTypographyDefaults.fallbackLineHeight
            }
            sizeValue={
              activeSlide?.bodyFontSize ?? bodyTypographyDefaults.fallbackSize
            }
            weightValue={
              activeSlide?.bodyFontWeight ??
              state.bodyFontWeight ??
              bodyTypographyDefaults.fallbackWeight
            }
            onColorChange={(bodyTextColor) =>
              updateEditingSlide({ bodyTextColor })
            }
            onFontChange={(bodyFont) => updateEditingSlide({ bodyFont })}
            onLineHeightChange={(bodyLineHeight) =>
              updateEditingSlide({ bodyLineHeight })
            }
            onSizeChange={(bodyFontSize) =>
              updateEditingSlide({ bodyFontSize })
            }
            onToggle={(hasCustomBodyTypography) =>
              updateEditingSlide(
                buildSlideTypographyToggleUpdates(
                  activeSlide,
                  state,
                  bodyTypographyDefaults,
                  hasCustomBodyTypography,
                ),
              )
            }
            onWeightChange={(bodyFontWeight) =>
              updateEditingSlide({ bodyFontWeight })
            }
          />
        </DrawerSection>
        <DrawerSection>
          <DrawerSectionHeading>top CTA</DrawerSectionHeading>
          <SettingItem>
            <Label
              content="Top CTA"
              help="Control whether this slide shows the top CTA and what happens when someone clicks it."
            />
          </SettingItem>
          <SettingItem>
            <Checkbox
              label="Show top CTA"
              value={activeSlide?.showAllProjectsCta !== false}
              onChange={(showAllProjectsCta) =>
                updateEditingSlide({ showAllProjectsCta })
              }
            />
          </SettingItem>
          {activeSlide?.showAllProjectsCta !== false ? (
            <SettingItem>
              <Label
                content="Shape"
                help="Choose the button shape for the top CTA on this slide."
              />
              <Dropdown
                options={badgeShapeOptions}
                value={activeSlide?.allProjectsButtonShape || "flat"}
                onChange={(allProjectsButtonShape) =>
                  updateEditingSlide({ allProjectsButtonShape })
                }
              />
            </SettingItem>
          ) : null}
          <CtaSettings
            actionLabel="Top CTA action"
            actionSetHelp="Choose the actions that should run when the top CTA is clicked on this slide."
            actionSetValue={
              Array.isArray(activeSlide?.allProjectsActionSet)
                ? activeSlide.allProjectsActionSet
                : []
            }
            actionType={activeSlide?.allProjectsActionType || "trigger"}
            hasSuffixIcon={activeSlide?.allProjectsHasSuffixIcon !== false}
            hideToggle={true}
            isVisible={activeSlide?.showAllProjectsCta !== false}
            suffixIconColor={activeSlide?.allProjectsSuffixIconColor || ""}
            suffixIconValue={
              activeSlide?.allProjectsSuffixIcon || DEFAULT_TOP_CTA_SUFFIX_ICON
            }
            textLabel="Top CTA Text"
            textValue={activeSlide?.allProjectsText || ""}
            toggleHelp="Control whether this slide shows the top CTA and what happens when someone clicks it."
            toggleLabel="Top CTA"
            urlValue={activeSlide?.allProjectsUrl || ""}
            onActionSetChange={(allProjectsActionSet) =>
              updateEditingSlide({ allProjectsActionSet })
            }
            onActionTypeChange={(allProjectsActionType) =>
              updateEditingSlide({ allProjectsActionType })
            }
            onSuffixIconChange={(allProjectsSuffixIcon) =>
              updateEditingSlide({ allProjectsSuffixIcon })
            }
            onSuffixIconColorChange={(allProjectsSuffixIconColor) =>
              updateEditingSlide({ allProjectsSuffixIconColor })
            }
            onTextChange={(allProjectsText) =>
              updateEditingSlide({
                allProjectsText,
                allProjectsTextCleared: allProjectsText === "",
              })
            }
            onToggleSuffixIcon={(allProjectsHasSuffixIcon) =>
              updateEditingSlide({
                allProjectsHasSuffixIcon,
                allProjectsSuffixIcon: allProjectsHasSuffixIcon
                  ? normalizeSvgMarkup(
                      activeSlide?.allProjectsSuffixIcon ||
                        DEFAULT_TOP_CTA_SUFFIX_ICON,
                    ) || DEFAULT_TOP_CTA_SUFFIX_ICON
                  : activeSlide?.allProjectsSuffixIcon ||
                    DEFAULT_TOP_CTA_SUFFIX_ICON,
              })
            }
            onToggleVisibility={(showAllProjectsCta) =>
              updateEditingSlide({ showAllProjectsCta })
            }
            onUrlChange={(allProjectsUrl) =>
              updateEditingSlide({ allProjectsUrl })
            }
          />
        </DrawerSection>
        <DrawerSection>
          <DrawerSectionHeading>body CTA</DrawerSectionHeading>
          <SettingItem>
            <Label
              content="Body CTA"
              help="Control whether this slide shows a Body CTA and what happens when someone clicks it."
            />
          </SettingItem>
          <SettingItem>
            <Checkbox
              label="Show body CTA"
              value={activeSlide?.showExploreCta !== false}
              onChange={(showExploreCta) =>
                updateEditingSlide({ showExploreCta })
              }
            />
          </SettingItem>
          {activeSlide?.showExploreCta !== false ? (
            <>
              <SettingItem>
                <Label
                  content="Shape"
                  help="Choose the button shape for the body CTA on this slide."
                />
                <Dropdown
                  options={badgeShapeOptions}
                  value={activeSlide?.exploreButtonShape || "outlined-pill"}
                  onChange={(exploreButtonShape) =>
                    updateEditingSlide({ exploreButtonShape })
                  }
                />
              </SettingItem>
              <SettingItem>
                <Label
                  content="Color"
                  help="Override the body CTA button color for this slide. Leave unset to use the slide's default text color."
                />
                <ColorPicker
                  value={
                    activeSlide?.exploreButtonColor ||
                    activeSlide?.textColor ||
                    "#000000"
                  }
                  onChange={(exploreButtonColor) =>
                    updateEditingSlide({ exploreButtonColor })
                  }
                />
              </SettingItem>
            </>
          ) : null}
          <CtaSettings
            actionLabel="Body CTA action"
            actionSetHelp="Choose the actions that should run when the Body CTA is clicked on this slide."
            actionSetValue={
              Array.isArray(activeSlide?.exploreActionSet)
                ? activeSlide.exploreActionSet
                : []
            }
            actionType={activeSlide?.exploreActionType || "trigger"}
            hasSuffixIcon={Boolean(activeSlide?.exploreHasSuffixIcon)}
            hideToggle={true}
            isVisible={activeSlide?.showExploreCta !== false}
            suffixIconColor={activeSlide?.exploreSuffixIconColor || ""}
            suffixIconValue={activeSlide?.exploreSuffixIcon || ""}
            textLabel="Body CTA Text"
            textValue={activeSlide?.exploreText || ""}
            toggleHelp="Control whether this slide shows a Body CTA and what happens when someone clicks it."
            toggleLabel="Body CTA"
            urlValue={activeSlide?.exploreUrl || ""}
            onActionSetChange={(exploreActionSet) =>
              updateEditingSlide({ exploreActionSet })
            }
            onActionTypeChange={(exploreActionType) =>
              updateEditingSlide({ exploreActionType })
            }
            onSuffixIconChange={(exploreSuffixIcon) =>
              updateEditingSlide({ exploreSuffixIcon })
            }
            onSuffixIconColorChange={(exploreSuffixIconColor) =>
              updateEditingSlide({ exploreSuffixIconColor })
            }
            onTextChange={(exploreText) =>
              updateEditingSlide({
                exploreText,
                exploreTextCleared: exploreText === "",
              })
            }
            onToggleSuffixIcon={(exploreHasSuffixIcon) =>
              updateEditingSlide({
                exploreHasSuffixIcon,
                exploreSuffixIcon: exploreHasSuffixIcon
                  ? normalizeSvgMarkup(
                      activeSlide?.exploreSuffixIcon ||
                        DEFAULT_TOP_CTA_SUFFIX_ICON,
                    )
                  : activeSlide?.exploreSuffixIcon || "",
              })
            }
            onToggleVisibility={(showExploreCta) =>
              updateEditingSlide({ showExploreCta })
            }
            onUrlChange={(exploreUrl) => updateEditingSlide({ exploreUrl })}
          />
        </DrawerSection>
      </Drawer>
    </>
  );
}

function GoToSlideActionSetting({ actionState, setActionState, slideCount }) {
  const safeSlideCount = Math.max(1, Number(slideCount) || 1);
  const slideNumber = Math.min(
    safeSlideCount,
    Math.max(1, Number(actionState.slideNumber) || 1),
  );

  return (
    <SettingItem>
      <Label
        content="Slide number"
        help="Use a 1-based slide number. The action clamps values to the available slides at runtime."
      />
      <NumberInput
        max={safeSlideCount}
        min={1}
        step={1}
        value={slideNumber}
        onChange={(nextSlideNumber) => {
          const resolvedSlideNumber = Math.min(
            safeSlideCount,
            Math.max(1, Number(nextSlideNumber) || 1),
          );
          setActionState({ ...actionState, slideNumber: resolvedSlideNumber });
        }}
      />
    </SettingItem>
  );
}

export function getSettings() {
  return {
    settings: {
      name: "Showcase Slider",
      Setting: Settings,
      width: 500,
      help: () => ({
        title: "Showcase Slider Help",
        content: (
          <>
            <h1>Showcase Slider</h1>
            <p>
              Present featured case studies or projects in a full-width slider
              with editable slides, navigation controls, and optional auto-play.
            </p>

            <h2>Slides tab</h2>
            <ul>
              <li>
                <strong>Slides</strong> — Add, reorder, duplicate, edit, and
                delete slides from the table view.
              </li>
              <li>
                <strong>Edit Slide drawer</strong> — Edit each slide's image,
                background color, text color, badge, headline, body, top CTA,
                and body CTA.
              </li>
              <li>
                <strong>Per-slide typography</strong> — Badge, Headline, and
                Body can each enable a custom font family, weight, size, and
                line height for that slide only.
              </li>
              <li>
                <strong>Top CTA</strong> — Set the per-slide top link label,
                visibility, suffix icon, and whether it opens a URL or runs an
                ActionSet.
              </li>
              <li>
                <strong>Body CTA</strong> — Set the per-slide button label,
                visibility, shape, color, suffix icon, and whether it opens a
                URL or runs an ActionSet.
              </li>
              <li>
                <strong>Show indicators</strong> — Toggle slide indicators and
                choose the style (<em>Dots</em>, <em>Numbers</em>, <em>Bars</em>
                , or <em>Morph</em>) and size.
              </li>
              <li>
                <strong>Show arrows</strong> — Toggle the previous and next
                arrow controls.
              </li>
            </ul>

            <h2>Global styles tab</h2>
            <ul>
              <li>
                <strong>Badge</strong> — Set the global font family, font
                weight, and badge shape used across all slides.
              </li>
              <li>
                <strong>Headline</strong> — Set the global font family and font
                weight for headline text.
              </li>
              <li>
                <strong>Body</strong> — Set the global font family and font
                weight for body copy, the top CTA, and the body CTA.
              </li>
              <li>
                <strong>Image</strong> — Adjust the corner rounding for the main
                slide image.
              </li>
              <li>
                <strong>Navigation</strong> — Choose the arrow color for
                previous and next navigation buttons.
              </li>
              <li>
                <strong>Indicators</strong> — Choose the color for slide
                indicators.
              </li>
            </ul>

            <h2>Behavior tab</h2>
            <ul>
              <li>
                <strong>Slide animation</strong> — Choose how each incoming
                slide animates into view.
              </li>
              <li>
                <strong>Slide direction</strong> — Choose which side or edge the
                motion-based Slide transition comes from.
              </li>
              <li>
                <strong>Enable auto-play</strong> — Turn automatic slide
                rotation on or off.
              </li>
              <li>
                <strong>Interval (ms)</strong> and{" "}
                <strong>Pause on hover</strong> — Define how auto-play behaves
                when enabled. The live component shows a paused status label
                when auto-play is currently paused.
              </li>
            </ul>

            <h2>Advanced tab</h2>
            <ul>
              <li>
                <strong>Enable width breakpoint</strong> — Switch the layout to
                its compact stacked version when the component becomes narrow
                enough.
              </li>
              <li>
                <strong>Breakpoint width</strong> — Set the maximum component
                width that should use the compact layout.
              </li>
              <li>
                <strong>Preview current width in live view</strong> — Show the
                measured component width as an overlay while configuring the
                breakpoint.
              </li>
            </ul>

            <h2>Actions</h2>
            <ul>
              <li>
                <strong>Next Slide</strong> — Advance the slider to the next
                slide.
              </li>
              <li>
                <strong>Previous Slide</strong> — Move the slider back to the
                previous slide.
              </li>
              <li>
                <strong>Go To Slide</strong> — Jump directly to a configured
                slide number.
              </li>
              <li>
                <strong>Pause Auto-Play</strong> — Pause automatic slide
                rotation until Resume Auto-Play is triggered.
              </li>
              <li>
                <strong>Resume Auto-Play</strong> — Restart automatic slide
                rotation after it was paused by an action.
              </li>
            </ul>

            <h2>Triggers</h2>
            <ul>
              <li>
                <strong>On Slide Changed</strong> — Fire after the active slide
                changes through navigation, auto-play, or an inbound action.
              </li>
            </ul>
          </>
        ),
      }),
    },
  };
}

export function getDataFields() {
  return {
    currentSlideIndex: { name: "Current Slide Index", type: "number" },
    exploreClicked: { name: "Body CTA Clicked", type: "boolean" },
    allProjectsClicked: { name: "All Projects Clicked", type: "boolean" },
  };
}

export function getActions(state) {
  const slideCount =
    Array.isArray(state?.slides) && state.slides.length
      ? state.slides.length
      : 1;

  return {
    nextSlide: {
      name: "Next Slide",
      info: { text: "Advances to the next slide in the showcase slider" },
      state: {},
      Setting: () => null,
    },
    prevSlide: {
      name: "Previous Slide",
      info: { text: "Goes back to the previous slide in the showcase slider" },
      state: {},
      Setting: () => null,
    },
    goToSlide: {
      name: "Go To Slide",
      info: {
        text: "Jumps directly to a specific slide number in the showcase slider",
      },
      state: { slideNumber: 1 },
      Setting({ actionState, setActionState }) {
        return (
          <GoToSlideActionSetting
            actionState={actionState}
            setActionState={setActionState}
            slideCount={slideCount}
          />
        );
      },
    },
    pauseAutoPlay: {
      name: "Pause Auto-Play",
      info: {
        text: "Pauses automatic slide rotation without changing the configured slides",
      },
      state: {},
      Setting: () => null,
    },
    resumeAutoPlay: {
      name: "Resume Auto-Play",
      info: {
        text: "Resumes automatic slide rotation after it was paused by an action",
      },
      state: {},
      Setting: () => null,
    },
  };
}

export function getTriggers() {
  return {
    onSlideChange: { name: "On Slide Changed" },
  };
}

export function getFonts(state) {
  const slideFonts = Array.isArray(state.slides)
    ? state.slides.flatMap((slide) => [
        slide?.hasCustomBadgeTypography ? slide.badgeFont : null,
        slide?.hasCustomHeadlineTypography ? slide.headlineFont : null,
        slide?.hasCustomBodyTypography ? slide.bodyFont : null,
      ])
    : [];

  return [
    ...new Set(
      [
        state.badgeFont || state.font,
        state.headlineFont || state.font,
        state.bodyFont || state.font,
        state.font,
        ...slideFonts,
      ].filter((font) => typeof font === "string" && font.trim()),
    ),
  ];
}

export function getSizeTypes() {
  return {
    width: SizeType.RESIZABLE,
    height: SizeType.CONTENT_BASED,
  };
}

export function getLiveState(state) {
  return state;
}
```

END

FILE: /live/index.js

```javascript
// HEIGHT_PATTERN: CONTENT_BASED
import React, { useState, useEffect, useRef } from "react";
import { runActionSet } from "@data";
import { ScopedStyle } from "@utils";
import { useScaler } from "@hooks";
import { getInitialState } from "@common/index";
export { getInitialState };

function CtaSuffixIcon({ className, color, svgMarkup }) {
  if (!svgMarkup) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
      style={color ? { color } : undefined}
    />
  );
}

// --- Pure helpers (no s() — called outside Component) ---

function clampFontWeight(value, fallback) {
  return Math.min(900, Math.max(100, Number(value) || fallback));
}

function clampFontSize(value) {
  return value ? Math.max(8, Number(value)) : null;
}

function clampLineHeight(value, fallback) {
  return Math.max(0.5, Number(value) || fallback);
}

function resolveTypographyValues(prefix, state, activeSlide, usesCustom) {
  const sharedFamily = state[`${prefix}Font`] || state.font;
  const sharedWeight = clampFontWeight(
    state[`${prefix}FontWeight`],
    prefix === "badge" ? 700 : 400,
  );
  const sharedSize = clampFontSize(state[`${prefix}FontSize`]);

  return {
    fontFamily: usesCustom
      ? activeSlide[`${prefix}Font`] || sharedFamily
      : sharedFamily,
    fontWeight: usesCustom
      ? clampFontWeight(
          activeSlide[`${prefix}FontWeight`] || sharedWeight,
          sharedWeight,
        )
      : sharedWeight,
    sharedSize,
  };
}

function resolveButtonStyle(shape, baseTextColor, baseBackgroundColor, s) {
  const isFlat = shape === "flat";
  const isOutlined = shape.startsWith("outlined-");
  const isFilled = !isFlat && !isOutlined;
  const baseShape = isFlat
    ? ""
    : isOutlined
      ? shape.replace("outlined-", "")
      : shape.replace("filled-", "");
  const borderRadius =
    baseShape === "square" ? 0 : baseShape === "rounded" ? 8 : 999;
  const paddingY = isFlat ? 0 : 14;
  const paddingX = isFlat ? 0 : 28;
  const border = isFlat
    ? "none"
    : isOutlined
      ? `${s(1)}px solid ${baseTextColor}`
      : "none";
  const bgColor = isFilled ? baseTextColor : "transparent";
  const textColor = isFilled ? baseBackgroundColor : "inherit";
  return {
    isFlat,
    isOutlined,
    isFilled,
    borderRadius,
    paddingY,
    paddingX,
    border,
    bgColor,
    textColor,
  };
}

export function getActionHandlers() {
  return {
    nextSlide({ setComponentState }) {
      setComponentState((prev) => {
        if (!prev.slides || prev.slides.length <= 1) return prev;
        const nextIndex = (prev.currentSlideIndex || 0) + 1;
        return {
          ...prev,
          currentSlideIndex: nextIndex >= prev.slides.length ? 0 : nextIndex,
        };
      });
    },
    prevSlide({ setComponentState }) {
      setComponentState((prev) => {
        if (!prev.slides || prev.slides.length <= 1) return prev;
        const currentIndex = prev.currentSlideIndex || 0;
        const prevIndex = currentIndex - 1;
        return {
          ...prev,
          currentSlideIndex: prevIndex < 0 ? prev.slides.length - 1 : prevIndex,
        };
      });
    },
    goToSlide({ actionState, setComponentState }) {
      const requestedSlideNumber = Math.floor(
        Number(actionState?.slideNumber) || 1,
      );

      setComponentState((prev) => {
        const slideCount = Array.isArray(prev.slides) ? prev.slides.length : 0;

        if (slideCount <= 0) {
          return prev;
        }

        const targetIndex = Math.min(
          slideCount - 1,
          Math.max(0, requestedSlideNumber - 1),
        );

        if (targetIndex === (prev.currentSlideIndex || 0)) {
          return prev;
        }

        return {
          ...prev,
          currentSlideIndex: targetIndex,
        };
      });
    },
    pauseAutoPlay({ setComponentState }) {
      setComponentState((prev) => {
        if (prev.manualAutoPlayPaused) {
          return prev;
        }

        return {
          ...prev,
          manualAutoPlayPaused: true,
        };
      });
    },
    resumeAutoPlay({ setComponentState }) {
      setComponentState((prev) => {
        if (!prev.manualAutoPlayPaused) {
          return prev;
        }

        return {
          ...prev,
          manualAutoPlayPaused: false,
        };
      });
    },
  };
}

export function Component({ state, setState, runTrigger }) {
  const { s } = useScaler();
  const containerRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(
    state.currentSlideIndex || 0,
  );
  const [isHovered, setIsHovered] = useState(false);
  const [failedImageKeys, setFailedImageKeys] = useState({});
  const currentIndexRef = useRef(currentIndex);
  const setStateRef = useRef(setState);
  const runTriggerRef = useRef(runTrigger);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    setStateRef.current = setState;
    runTriggerRef.current = runTrigger;
  }, [runTrigger, setState]);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || typeof window === "undefined") {
      return undefined;
    }

    let frameId = 0;
    let resizeObserver = null;

    const readMeasuredWidth = (targetElement) => {
      if (!targetElement) {
        return 0;
      }

      const rect = targetElement.getBoundingClientRect();
      return rect.width;
    };

    const syncMeasuredWidth = (nextWidth) => {
      const safeWidth = Math.round(Number(nextWidth) || 0);

      setMeasuredWidth((prevWidth) => {
        if (prevWidth === safeWidth) {
          return prevWidth;
        }

        return safeWidth;
      });

      setStateRef.current((prev) => {
        if (prev.currentComponentWidth === safeWidth) {
          return prev;
        }

        return {
          ...prev,
          currentComponentWidth: safeWidth,
        };
      });
    };

    const measureNow = () => {
      syncMeasuredWidth(readMeasuredWidth(element));
    };

    if (window.ResizeObserver) {
      resizeObserver = new window.ResizeObserver((entries) => {
        const entry = entries && entries[0];

        if (!entry) {
          return;
        }

        syncMeasuredWidth(readMeasuredWidth(element));
      });
      resizeObserver.observe(element);
    }

    measureNow();
    frameId = window.requestAnimationFrame(measureNow);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [setState]);

  const slides = state.slides || [];
  const activeSlide = slides[currentIndex];
  const liveMeasuredWidth = Math.max(0, Number(measuredWidth) || 0);
  const resolvedMeasuredWidth = Math.max(
    0,
    liveMeasuredWidth || Number(state.currentComponentWidth) || 0,
  );
  const breakpointWidth = Math.max(120, Number(state.widthBreakpoint) || 900);
  const isCompactLayout =
    Boolean(state.hasWidthBreakpoint) &&
    resolvedMeasuredWidth > 0 &&
    resolvedMeasuredWidth <= breakpointWidth;
  const isAutoPlayPaused =
    Boolean(state.manualAutoPlayPaused) || (state.pauseOnHover && isHovered);
  const indicatorSize = Math.max(6, Number(state.indicatorSize) || 10);
  const dotSize = indicatorSize;
  const numberSize = Math.max(18, Math.round(indicatorSize * 1.8));
  const numberFontSize = Math.max(14, Math.round(indicatorSize * 1.4));
  const barWidth = Math.max(20, Math.round(indicatorSize * 2.8));
  const barHeight = Math.max(4, Math.round(indicatorSize * 0.4));
  const imageBorderRadius = Math.max(0, Number(state.imageBorderRadius) || 0);
  const imageAspectRatio =
    state.imageAspectRatio && state.imageAspectRatio !== "natural"
      ? state.imageAspectRatio
      : null;
  const badgeShape = state.badgeShape || "outlined-pill";
  const isFlatBadge = badgeShape === "flat";
  const isOutlinedBadge = badgeShape.startsWith("outlined-");
  const badgeBaseShape = isOutlinedBadge
    ? badgeShape.replace("outlined-", "")
    : badgeShape.replace("filled-", "");
  const badgeBorderRadius =
    badgeBaseShape === "square" ? 0 : badgeBaseShape === "rounded" ? 8 : 999;
  const badgePaddingY = isFlatBadge ? 0 : 6;
  const badgePaddingX = isFlatBadge ? 0 : 14;
  const baseTextColor = activeSlide.textColor || "currentColor";
  const baseBackgroundColor = activeSlide.bgColor || "#ffffff";
  const usesCustomBadgeColors = Boolean(activeSlide.hasCustomBadgeColors);

  const usesCustomBadgeTypography = Boolean(
    activeSlide.hasCustomBadgeTypography,
  );
  const usesCustomHeadlineTypography = Boolean(
    activeSlide.hasCustomHeadlineTypography,
  );
  const usesCustomBodyTypography = Boolean(activeSlide.hasCustomBodyTypography);

  const badgeTypo = resolveTypographyValues(
    "badge",
    state,
    activeSlide,
    usesCustomBadgeTypography,
  );
  const badgeFontFamily = badgeTypo.fontFamily;
  const badgeFontWeight = badgeTypo.fontWeight;
  const sharedBadgeFontSize = badgeTypo.sharedSize;

  const headlineTypo = resolveTypographyValues(
    "headline",
    state,
    activeSlide,
    usesCustomHeadlineTypography,
  );
  const headlineFontFamily = headlineTypo.fontFamily;
  const headlineFontWeight = headlineTypo.fontWeight;
  const sharedHeadlineFontSize = headlineTypo.sharedSize;

  const bodyTypo = resolveTypographyValues(
    "body",
    state,
    activeSlide,
    usesCustomBodyTypography,
  );
  const bodyCopyFontFamily = bodyTypo.fontFamily;
  const bodyCopyFontWeight = bodyTypo.fontWeight;
  const sharedBodyFontFamily = state.bodyFont || state.font;
  const sharedBodyFontWeight = clampFontWeight(state.bodyFontWeight, 400);
  const sharedBodyFontSize = bodyTypo.sharedSize;
  const badgeTextTransform = "none";
  const badgeLetterSpacing = 0.2;
  const badgeAccentColor = usesCustomBadgeColors
    ? activeSlide.badgeFillColor || baseTextColor
    : baseTextColor;
  const badgeFillColor = badgeAccentColor;
  const badgeBorderColor = badgeAccentColor;
  const badgeTextColor = usesCustomBadgeColors
    ? isFlatBadge || isOutlinedBadge
      ? badgeAccentColor
      : baseBackgroundColor
    : isFlatBadge || isOutlinedBadge
      ? "inherit"
      : baseBackgroundColor;
  const headlineColor = usesCustomHeadlineTypography
    ? activeSlide.headlineTextColor || state.headlineTextColor || baseTextColor
    : state.headlineTextColor || baseTextColor;
  const bodyColor = usesCustomBodyTypography
    ? activeSlide.bodyTextColor || state.bodyTextColor || baseTextColor
    : state.bodyTextColor || baseTextColor;
  const bodyOpacity = 1;
  const exploreBtn = resolveButtonStyle(
    activeSlide.exploreButtonShape || "outlined-pill",
    baseTextColor,
    baseBackgroundColor,
    s,
  );
  const exploreBorderRadius = exploreBtn.borderRadius;
  const explorePaddingY = exploreBtn.paddingY;
  const explorePaddingX = exploreBtn.paddingX;
  const exploreBtnBorder = exploreBtn.border;
  const exploreBtnBgColor = exploreBtn.bgColor;
  const exploreBtnTextColor = exploreBtn.textColor;

  const allProjectsBtn = resolveButtonStyle(
    activeSlide.allProjectsButtonShape || "flat",
    baseTextColor,
    baseBackgroundColor,
    s,
  );
  const allProjectsBorderRadius = allProjectsBtn.borderRadius;
  const allProjectsPaddingY = allProjectsBtn.paddingY;
  const allProjectsPaddingX = allProjectsBtn.paddingX;
  const allProjectsBtnBorder = allProjectsBtn.border;
  const allProjectsBtnBgColor = allProjectsBtn.bgColor;
  const allProjectsBtnTextColor = allProjectsBtn.textColor;
  const badgeBorder = isFlatBadge
    ? "none"
    : isOutlinedBadge
      ? `${s(1)}px solid ${badgeBorderColor}`
      : "none";
  const badgeBackgroundColor =
    isFlatBadge || isOutlinedBadge ? "transparent" : badgeFillColor;
  const isMorphIndicatorStyle =
    state.indicatorStyle === "barDots" || state.indicatorStyle === "morph";
  const indicatorGap = isCompactLayout
    ? isMorphIndicatorStyle
      ? Math.max(
          2,
          Math.round(Math.max(6, Math.round(indicatorSize * 0.35)) * 0.8),
        )
      : 8
    : isMorphIndicatorStyle
      ? Math.max(6, Math.round(indicatorSize * 0.35))
      : 12;
  const shouldShowPausedIndicator = Boolean(
    state.showIndicators && state.autoPlayEnabled && isAutoPlayPaused,
  );
  const pausedIndicatorLabel = state.manualAutoPlayPaused
    ? "Auto-play paused"
    : "Paused on hover";
  const slideAnimation =
    state.slideAnimation === "fadeUp" ? "fade" : state.slideAnimation || "fade";
  const slideDirection = state.slideDirection || "left";
  const slideOffsetX =
    slideDirection === "left" ? s(72) : slideDirection === "right" ? -s(72) : 0;
  const slideOffsetY =
    slideDirection === "up" ? s(44) : slideDirection === "down" ? -s(44) : 0;
  const slideAnimationClassName =
    slideAnimation === "none" ? "" : ` carousel-body--${slideAnimation}`;
  const rootPadding = isCompactLayout ? 24 : 40;
  const rootPaddingX = isCompactLayout ? 24 : 60;
  const headerMarginBottom = isCompactLayout ? 30 : 60;
  const topRowAlignItems = isCompactLayout ? "flex-start" : "flex-end";
  const topRowDirection = isCompactLayout ? "column" : "row";
  const topRowGap = isCompactLayout ? 24 : 40;
  const topRowMarginBottom = isCompactLayout ? 24 : 40;
  const headlineBaseFontSize = isCompactLayout ? 40 : 64;
  const bodyBaseFontSize = isCompactLayout ? 16 : 18;
  const badgeFontSize = usesCustomBadgeTypography
    ? Math.max(
        8,
        Number(activeSlide.badgeFontSize) || sharedBadgeFontSize || 11,
      )
    : sharedBadgeFontSize || 11;
  const badgeLineHeight = clampLineHeight(activeSlide.badgeLineHeight, 1.2);
  const headlineFontSize = usesCustomHeadlineTypography
    ? Math.max(
        8,
        Number(activeSlide.headlineFontSize) ||
          sharedHeadlineFontSize ||
          headlineBaseFontSize,
      )
    : sharedHeadlineFontSize || headlineBaseFontSize;
  const headlineLineHeight = usesCustomHeadlineTypography
    ? clampLineHeight(activeSlide.headlineLineHeight, 1.15)
    : 1.15;
  const bodyFontSize = usesCustomBodyTypography
    ? Math.max(
        8,
        Number(activeSlide.bodyFontSize) ||
          sharedBodyFontSize ||
          bodyBaseFontSize,
      )
    : sharedBodyFontSize || bodyBaseFontSize;
  const bodyLineHeight = usesCustomBodyTypography
    ? clampLineHeight(activeSlide.bodyLineHeight, 1.6)
    : 1.6;
  const compactBadgeMarginTop = isCompactLayout ? 14 : 0;
  const compactBadgePaddingTop = isCompactLayout ? 6 : 0;
  const pausedIndicatorOffset = isCompactLayout ? 8 : 12;
  const pausedIndicatorFontSize = isCompactLayout ? 11 : 12;
  const showCompactBadge = isCompactLayout && Boolean(activeSlide?.client);

  if (!activeSlide) return null;

  const activeImageKey = `${activeSlide.id || currentIndex}:${activeSlide.image || ""}`;
  const hasImageSource = Boolean(String(activeSlide.image || "").trim());
  const showActiveImage = hasImageSource && !failedImageKeys[activeImageKey];
  const shouldShowAllProjectsCta =
    activeSlide.showAllProjectsCta ?? state.showAllProjectsCta ?? true;
  const allProjectsText = activeSlide.allProjectsTextCleared
    ? ""
    : typeof activeSlide.allProjectsText === "string"
      ? activeSlide.allProjectsText
      : "";
  const allProjectsHasSuffixIcon =
    activeSlide.allProjectsHasSuffixIcon !== false;
  const allProjectsSuffixIcon = allProjectsHasSuffixIcon
    ? activeSlide.allProjectsSuffixIcon || ""
    : "";
  const allProjectsSuffixIconColor = allProjectsHasSuffixIcon
    ? activeSlide.allProjectsSuffixIconColor || ""
    : "";
  const allProjectsActionType =
    activeSlide.allProjectsActionType ||
    state.allProjectsActionType ||
    "trigger";
  const allProjectsUrl =
    typeof activeSlide.allProjectsUrl === "string"
      ? activeSlide.allProjectsUrl.trim()
      : typeof state.allProjectsUrl === "string"
        ? state.allProjectsUrl.trim()
        : "";
  const allProjectsActionSet = Array.isArray(activeSlide.allProjectsActionSet)
    ? activeSlide.allProjectsActionSet
    : Array.isArray(state.allProjectsActionSet)
      ? state.allProjectsActionSet
      : [];
  const shouldShowExploreCta = activeSlide.showExploreCta !== false;
  const exploreText = activeSlide.exploreTextCleared
    ? ""
    : typeof activeSlide.exploreText === "string"
      ? activeSlide.exploreText
      : "";
  const exploreHasSuffixIcon = Boolean(activeSlide.exploreHasSuffixIcon);
  const exploreSuffixIcon = exploreHasSuffixIcon
    ? activeSlide.exploreSuffixIcon || ""
    : "";
  const exploreSuffixIconColor = exploreHasSuffixIcon
    ? activeSlide.exploreSuffixIconColor || ""
    : "";
  const exploreActionType = activeSlide.exploreActionType || "trigger";
  const exploreUrl =
    typeof activeSlide.exploreUrl === "string"
      ? activeSlide.exploreUrl.trim()
      : "";
  const exploreActionSet = Array.isArray(activeSlide.exploreActionSet)
    ? activeSlide.exploreActionSet
    : [];

  useEffect(() => {
    const slideCount = slides.length;
    const nextIndex = Math.max(
      0,
      Math.min(
        Number(state.currentSlideIndex) || 0,
        Math.max(0, slideCount - 1),
      ),
    );

    if (slideCount <= 0 || nextIndex === currentIndex) {
      return;
    }

    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    runTriggerRef.current("onSlideChange");
  }, [currentIndex, slides.length, state.currentSlideIndex]);

  const goToSlide = (nextIndex) => {
    if (!slides.length) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(nextIndex, slides.length - 1));

    if (safeIndex === currentIndex) {
      return;
    }

    setCurrentIndex(safeIndex);
    setStateRef.current((prev) => ({ ...prev, currentSlideIndex: safeIndex }));

    runTriggerRef.current("onSlideChange");
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1 >= slides.length ? 0 : currentIndex + 1;
    goToSlide(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex =
      currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  };

  const handleExplore = async () => {
    setStateRef.current((prev) => ({ ...prev, exploreClicked: true }));

    if (exploreActionType === "url") {
      if (exploreUrl && typeof window !== "undefined") {
        window.open(exploreUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (exploreActionSet.length) {
      await runActionSet(exploreActionSet);
    }
  };

  const handleAllProjects = async () => {
    setStateRef.current((prev) => ({ ...prev, allProjectsClicked: true }));

    if (allProjectsActionType === "url") {
      if (allProjectsUrl && typeof window !== "undefined") {
        window.open(allProjectsUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (allProjectsActionSet.length) {
      await runActionSet(allProjectsActionSet);
    }
  };

  useEffect(() => {
    if (!state.autoPlayEnabled || slides.length <= 1 || isAutoPlayPaused) {
      return undefined;
    }

    const intervalMs = Math.max(2000, Number(state.autoPlayInterval) || 5000);
    const intervalId = setInterval(() => {
      const nextIndex =
        currentIndexRef.current + 1 >= slides.length
          ? 0
          : currentIndexRef.current + 1;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      setStateRef.current((prev) => ({
        ...prev,
        currentSlideIndex: nextIndex,
      }));
      runTriggerRef.current("onSlideChange");
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [
    isAutoPlayPaused,
    slides.length,
    state.autoPlayEnabled,
    state.autoPlayInterval,
  ]);

  const styles = `
    .carousel-root {
      width: 100%;
      height: auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      position: relative;
      padding: ${s(rootPadding)}px ${s(rootPaddingX)}px;
      transition: background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      font-family: ${sharedBodyFontFamily};
    }
    .carousel-header {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      margin-bottom: ${s(headerMarginBottom)}px;
      font-size: ${s(16)}px;
      letter-spacing: ${s(0.5)}px;
      flex-shrink: 0;
      gap: ${s(compactBadgePaddingTop)}px;
    }
    .carousel-header-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: ${s(24)}px;
    }
    .header-badge-slot,
    .all-projects-slot,
    .nav-arrows {
      flex: 1;
    }
    .header-badge-slot {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      min-width: 0;
    }
    .all-projects-slot {
      display: flex;
      align-items: center;
      justify-content: ${isCompactLayout ? "flex-start" : "center"};
      min-width: 0;
    }
    .all-projects-link {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: ${s(8)}px;
      padding: ${s(allProjectsPaddingY)}px ${s(allProjectsPaddingX)}px;
      border: ${allProjectsBtnBorder};
      background: ${allProjectsBtnBgColor};
      color: ${allProjectsBtnTextColor};
      cursor: pointer;
      font-weight: ${sharedBodyFontWeight};
      font-size: inherit;
      font-family: ${sharedBodyFontFamily};
      border-radius: ${s(allProjectsBorderRadius)}px;
      flex: 0 0 auto;
      transform: translateY(0);
      transition: transform 0.2s ease;
    }
    .all-projects-placeholder {
      width: 100%;
    }
    .all-projects-link:hover {
      transform: translateY(-${s(3)}px);
    }
    .all-projects-link svg {
      width: ${s(18)}px;
      height: ${s(18)}px;
    }
    .nav-arrows {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: ${s(32)}px;
    }
    .compact-badge-row {
      display: flex;
      justify-content: flex-start;
      margin-top: ${s(compactBadgeMarginTop)}px;
    }
    .nav-arrows button {
      background: none;
      border: none;
      color: ${state.arrowColor || "inherit"};
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s ease;
    }
    .nav-arrows button:hover {
      opacity: 0.6;
    }
    .nav-arrows svg {
      width: ${s(28)}px;
      height: ${s(28)}px;
    }
    .carousel-body {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    @keyframes fadeSlide {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideLeft {
      from { transform: translate(var(--carousel-slide-enter-x, ${s(72)}px), var(--carousel-slide-enter-y, 0)); }
      to { transform: translate(0, 0); }
    }
    @keyframes zoomSlide {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .carousel-body--fade {
      animation: fadeSlide 0.45s ease forwards;
    }
    .carousel-body--slideLeft {
      animation: slideLeft 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .carousel-body--zoom {
      animation: zoomSlide 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      transform-origin: center center;
    }
    .top-row {
      display: flex;
      flex-direction: ${topRowDirection};
      justify-content: space-between;
      align-items: ${topRowAlignItems};
      margin-bottom: ${s(topRowMarginBottom)}px;
      gap: ${s(topRowGap)}px;
      flex-shrink: 0;
    }
    .copy-group {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: flex-start;
      gap: ${s(16)}px;
      min-width: 0;
    }
    .client-badge {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      padding: ${s(badgePaddingY)}px ${s(badgePaddingX)}px;
      border: ${badgeBorder};
      border-radius: ${s(badgeBorderRadius)}px;
      background: ${badgeBackgroundColor};
      color: ${badgeTextColor};
      font-family: ${badgeFontFamily};
      font-size: ${badgeFontSize}px;
      font-weight: ${badgeFontWeight};
      letter-spacing: ${s(badgeLetterSpacing)}px;
      line-height: ${badgeLineHeight};
      text-transform: ${badgeTextTransform};
      box-sizing: border-box;
    }
    .headline {
      margin: 0;
      color: ${headlineColor};
      font-family: ${headlineFontFamily};
      font-size: ${headlineFontSize}px;
      font-weight: ${headlineFontWeight};
      line-height: ${headlineLineHeight};
      max-width: 100%;
      letter-spacing: -${s(0.5)}px;
    }
    .body-copy {
      max-width: ${s(680)}px;
      margin: 0;
      color: ${bodyColor};
      font-family: ${bodyCopyFontFamily};
      font-size: ${bodyFontSize}px;
      font-weight: ${bodyCopyFontWeight};
      line-height: ${bodyLineHeight};
      opacity: ${bodyOpacity};
    }
    .explore-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: ${s(10)}px;
      background: ${exploreBtnBgColor};
      border: ${exploreBtnBorder};
      color: ${exploreBtnTextColor};
      padding: ${s(explorePaddingY)}px ${s(explorePaddingX)}px;
      font-family: ${sharedBodyFontFamily};
      font-size: ${s(14)}px;
      font-weight: ${sharedBodyFontWeight};
      border-radius: ${s(exploreBorderRadius)}px;
      cursor: pointer;
      transform: translateY(0);
      transition: transform 0.2s ease;
      white-space: nowrap;
      margin-bottom: ${s(8)}px;
    }
    .carousel-cta-label {
      display: inline-flex;
      align-items: center;
    }
    .carousel-cta-icon {
      width: ${s(18)}px;
      height: ${s(18)}px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: currentColor;
      flex-shrink: 0;
    }
    .carousel-cta-icon svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .carousel-cta-icon svg *[fill]:not([fill="none"]) {
      fill: currentColor !important;
    }
    .carousel-cta-icon svg *[stroke]:not([stroke="none"]) {
      stroke: currentColor !important;
    }
    .explore-btn:hover {
      transform: translateY(-${s(3)}px);
    }
    .image-wrapper {
      flex: 0 0 auto;
      width: 100%;
      display: flex;
      align-items: stretch;
      justify-content: stretch;
      overflow: hidden;
      min-height: auto;
      border-radius: ${s(imageBorderRadius)}px;
      background: ${showActiveImage ? "rgba(255, 255, 255, 0.08)" : "none"};
      ${imageAspectRatio ? `aspect-ratio: ${imageAspectRatio};` : ""}
    }
    .slide-image,
    .image-placeholder {
      width: 100%;
      height: ${imageAspectRatio ? "100%" : "auto"};
      display: block;
    }
    .slide-image {
      object-fit: cover;
      object-position: center;
    }
    .image-placeholder {
      border: none;
      border-radius: ${s(imageBorderRadius)}px;
      background: none;
    }
    .slide-indicators {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: ${s(indicatorGap)}px;
      margin: ${s(24)}px 0 0 0;
      padding: 0;
      list-style: none;
      flex-shrink: 0;
    }
    .carousel-status-row {
      position: relative;
      display: flex;
      justify-content: center;
      margin-top: ${s(24)}px;
      flex-shrink: 0;
    }
    .carousel-status-anchor {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .carousel-status-row .slide-indicators {
      margin-top: 0;
    }
    .carousel-paused-indicator {
      position: absolute;
      top: 50%;
      left: calc(100% + ${s(pausedIndicatorOffset)}px);
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      gap: ${s(8)}px;
      padding: ${s(6)}px ${s(10)}px;
      border: none;
      border-radius: ${s(6)}px;
      background: rgba(255, 255, 255, 0.08);
      font-size: ${s(pausedIndicatorFontSize)}px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: ${s(0.3)}px;
      text-transform: none;
      opacity: 0.72;
      box-sizing: border-box;
      white-space: nowrap;
      pointer-events: none;
    }
    .carousel-paused-indicator-icon {
      position: relative;
      width: ${s(9)}px;
      height: ${s(9)}px;
      display: inline-block;
      flex-shrink: 0;
      opacity: 0.9;
    }
    .carousel-paused-indicator-icon::before,
    .carousel-paused-indicator-icon::after {
      content: '';
      position: absolute;
      top: 0;
      width: ${s(3)}px;
      height: 100%;
      border-radius: ${s(999)}px;
      background: currentColor;
    }
    .carousel-paused-indicator-icon::before {
      left: 0;
    }
    .carousel-paused-indicator-icon::after {
      right: 0;
    }
    .slide-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: ${s(32)}px;
      min-height: ${s(32)}px;
      color: ${state.indicatorColor || "inherit"};
      opacity: 0.45;
      transition: opacity 0.25s ease;
    }
    .slide-indicator-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .slide-indicator.is-active {
      opacity: 1;
    }
    .slide-indicator--dots {
      min-width: ${s(dotSize)}px;
      min-height: ${s(dotSize)}px;
      width: ${s(dotSize)}px;
      height: ${s(dotSize)}px;
      border-radius: 999px;
      background: currentColor;
    }
    .slide-indicator--numbers {
      min-width: ${s(numberSize)}px;
      min-height: ${s(numberSize)}px;
      font-size: ${s(numberFontSize)}px;
      font-weight: 600;
      line-height: 1;
    }
    .slide-indicator--bars {
      min-width: ${s(barWidth)}px;
      min-height: ${s(barHeight)}px;
      width: ${s(barWidth)}px;
      height: ${s(barHeight)}px;
      border-radius: 999px;
      background: currentColor;
    }
    .slide-indicator--morph {
      min-width: ${s(dotSize)}px;
      min-height: ${s(dotSize)}px;
      width: ${s(dotSize)}px;
      height: ${s(dotSize)}px;
      border-radius: 999px;
      background: currentColor;
      transform-origin: center;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .slide-indicator--morph.is-active {
      min-width: ${s(barWidth)}px;
      min-height: ${s(dotSize)}px;
      width: ${s(barWidth)}px;
      height: ${s(dotSize)}px;
      transform: scaleX(1);
    }
  `;

  return (
    <>
      <ScopedStyle>{styles}</ScopedStyle>
      <div
        className="carousel-root"
        ref={containerRef}
        style={{
          "--carousel-slide-enter-x": `${slideOffsetX}px`,
          "--carousel-slide-enter-y": `${slideOffsetY}px`,
          backgroundColor: activeSlide.bgColor,
          color: activeSlide.textColor,
          height: "auto",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <header className="carousel-header">
          <div className="carousel-header-main">
            {!isCompactLayout ? (
              <div className="header-badge-slot">
                {activeSlide.client ? (
                  <div className="client-badge">{activeSlide.client}</div>
                ) : null}
              </div>
            ) : null}
            <div className="all-projects-slot">
              {shouldShowAllProjectsCta ? (
                <button
                  className="all-projects-link"
                  type="button"
                  onClick={handleAllProjects}
                >
                  <span className="carousel-cta-label">{allProjectsText}</span>
                  <CtaSuffixIcon
                    className="carousel-cta-icon"
                    color={allProjectsSuffixIconColor}
                    svgMarkup={allProjectsSuffixIcon}
                  />
                </button>
              ) : (
                <div aria-hidden="true" className="all-projects-placeholder" />
              )}
            </div>
            {state.showArrowButtons ? (
              <div className="nav-arrows">
                <button aria-label="Previous slide" onClick={handlePrev}>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 12H5M12 19l-7-7 7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button aria-label="Next slide" onClick={handleNext}>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div aria-hidden="true" className="nav-arrows" />
            )}
          </div>
          {showCompactBadge ? (
            <div className="compact-badge-row">
              <div className="client-badge">{activeSlide.client}</div>
            </div>
          ) : null}
        </header>

        <main
          className={`carousel-body${slideAnimationClassName}`}
          key={activeSlide.id}
        >
          <div className="top-row">
            <div className="copy-group">
              <h1 className="headline">{activeSlide.headline}</h1>
              {activeSlide.body ? (
                <p className="body-copy">{activeSlide.body}</p>
              ) : null}
            </div>
            {shouldShowExploreCta ? (
              <button className="explore-btn" onClick={handleExplore}>
                <span className="carousel-cta-label">{exploreText}</span>
                <CtaSuffixIcon
                  className="carousel-cta-icon"
                  color={exploreSuffixIconColor}
                  svgMarkup={exploreSuffixIcon}
                />
              </button>
            ) : null}
          </div>
          <div className="image-wrapper">
            {showActiveImage ? (
              <img
                alt={activeSlide.headline}
                className="slide-image"
                src={activeSlide.image}
                onError={() => {
                  setFailedImageKeys((prev) => ({
                    ...prev,
                    [activeImageKey]: true,
                  }));
                }}
              />
            ) : (
              <div aria-hidden="true" className="image-placeholder" />
            )}
          </div>
          {state.showIndicators ? (
            <div className="carousel-status-row">
              <div className="carousel-status-anchor">
                <ul className="slide-indicators">
                  {slides.map((slide, index) => {
                    const isActive = index === currentIndex;
                    const indicatorType =
                      state.indicatorStyle === "numbers" ||
                      state.indicatorStyle === "bars"
                        ? state.indicatorStyle
                        : isMorphIndicatorStyle
                          ? "morph"
                          : "dots";

                    return (
                      <li
                        className={`slide-indicator${isActive ? " is-active" : ""} slide-indicator--${indicatorType}`}
                        key={slide.id || index}
                      >
                        <button
                          aria-current={isActive ? "true" : undefined}
                          aria-label={`Go to slide ${index + 1}`}
                          className="slide-indicator-button"
                          type="button"
                          onClick={() => goToSlide(index)}
                        >
                          {indicatorType === "numbers" ? index + 1 : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {shouldShowPausedIndicator ? (
                  <div aria-live="polite" className="carousel-paused-indicator">
                    <span
                      aria-hidden="true"
                      className="carousel-paused-indicator-icon"
                    />
                    {pausedIndicatorLabel}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </main>
        {Boolean(state.previewWidthInLiveView) && resolvedMeasuredWidth > 0 ? (
          <div
            style={{
              position: "absolute",
              top: s(12),
              right: s(12),
              zIndex: 10,
              background: "rgba(17, 24, 39, 0.78)",
              color: "#ffffff",
              fontSize: `${s(12)}px`,
              fontWeight: 600,
              padding: `${s(6)}px ${s(12)}px`,
              borderRadius: s(999),
              pointerEvents: "none",
              lineHeight: 1,
            }}
          >
            Width: {liveMeasuredWidth || 0}px
          </div>
        ) : null}
      </div>
    </>
  );
}
```

END
