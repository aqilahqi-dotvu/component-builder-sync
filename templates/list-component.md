FILE: /common/index.js

```javascript
import { getUniqueId } from "@utils";

function normalizeBulletItem(bullet) {
  return typeof bullet === "string"
    ? { id: getUniqueId(), text: bullet }
    : {
        id: bullet?.id || getUniqueId(),
        text: String(bullet?.text || ""),
      };
}

export function getInitialState(state) {
  const showIntroSection = state.showIntroSection ?? state.showTitle ?? true;
  const baseFont =
    state.headingFontFamily ?? state.bodyFontFamily ?? state.font ?? "Arial";
  const defaultNumberBgColor = state.numberBgColor ?? "#111827";
  const defaultNumberTextColor = state.numberTextColor ?? "#ffffff";
  const animationPlaybackMode =
    state.animationPlaybackMode ??
    (state.animationAutoPlay ? "auto" : "manual");
  const sectionPaddingX = state.sectionPaddingX ?? state.cardPaddingX ?? 20;
  const sectionPaddingY = state.sectionPaddingY ?? state.cardPaddingY ?? 20;
  const defaultItems = [
    {
      id: getUniqueId(),
      title: "Choose your option",
      description:
        "Start by selecting the product, service, or path that best matches your needs.",
      numberBgColor: defaultNumberBgColor,
      numberTextColor: defaultNumberTextColor,
      bulletListStyle: "bullets",
      bullets: [
        { id: getUniqueId(), text: "Compare the available options." },
        { id: getUniqueId(), text: "Pick the route that fits your goal." },
      ],
    },
    {
      id: getUniqueId(),
      title: "Customize the details",
      description:
        "Adjust the content and styling to create a clear and branded step-by-step experience.",
      numberBgColor: defaultNumberBgColor,
      numberTextColor: defaultNumberTextColor,
      bulletListStyle: "alpha",
      bullets: [
        { id: getUniqueId(), text: "Edit the copy for each numbered item." },
        {
          id: getUniqueId(),
          text: "Add supporting bullet points where needed.",
        },
      ],
    },
    {
      id: getUniqueId(),
      title: "Launch with confidence",
      description:
        "Publish your component and guide users through the process with an easy-to-scan layout.",
      numberBgColor: defaultNumberBgColor,
      numberTextColor: defaultNumberTextColor,
      bulletListStyle: "roman",
      bullets: [
        { id: getUniqueId(), text: "Check the spacing across all items." },
        { id: getUniqueId(), text: "Preview the full flow before publishing." },
      ],
    },
  ];
  const normalizedItems = Array.isArray(state.items)
    ? state.items.map((item) => ({
        ...item,
        bulletListStyle: item?.bulletListStyle || "bullets",
        bullets: Array.isArray(item.bullets)
          ? item.bullets.map(normalizeBulletItem)
          : [],
      }))
    : defaultItems;

  return {
    showIntroSection,
    title: "How it works",
    introText:
      "Use this component to present a numbered list with child lists for each step.",
    headingFontFamily: baseFont,
    bodyFontFamily: baseFont,
    headingFontWeight: state.headingFontWeight ?? 700,
    bodyFontWeight: state.bodyFontWeight ?? 400,
    circleStyleType: "filled",
    circleOutlineWidth: 2,
    titleColor: "#1f2937",
    introColor: "#4b5563",
    itemTitleColor: "#111827",
    itemDescriptionColor: "#6b7280",
    cardBackgroundColor: "#ffffff",
    cardBorderColor: "#e5e7eb",
    sectionBackgroundColor: "#f9fafb",
    titleFontSize: 30,
    introFontSize: 16,
    numberSize: 40,
    numberOffsetX: 0,
    numberOffsetY: 0,
    itemContentAlignment: "start",
    itemTitleFontSize: 18,
    itemDescriptionFontSize: 14,
    itemGap: 16,
    bulletListTopGap: 12,
    bulletListGap: 8,
    sectionPaddingX,
    sectionPaddingY,
    animationStyle: "none",
    animationDuration: 700,
    animationStagger: 140,
    animationPlaybackMode,
    animationRunId: 0,
    lastClickedItemId: null,
    hasWidthBreakpoint: false,
    widthBreakpoint: 520,
    previewWidthInLiveView: false,
    currentComponentWidth: 0,
    currentComponentHeight: 0,
    titleFontSizeCompact: null,
    introFontSizeCompact: null,
    itemTitleFontSizeCompact: null,
    itemDescriptionFontSizeCompact: null,
    titleFontSizeCompactCustom: false,
    introFontSizeCompactCustom: false,
    itemTitleFontSizeCompactCustom: false,
    itemDescriptionFontSizeCompactCustom: false,
    items: defaultItems,
    ...state,
    bulletListTopGap: state.bulletListTopGap ?? 12,
    bulletListGap: state.bulletListGap ?? 8,
    items: normalizedItems,
  };
}
```

END

FILE: /editor/index.js

```javascript
import React, { useMemo, useState } from "react";
import {
  Checkbox,
  TextInput,
  NumberInput,
  Dropdown,
  FontSelector,
  ColorPicker,
  Tabs,
  Tab,
  Section,
  SettingItem,
  Label,
  TableContainer,
  OptionsMenuRootButton,
  Drawer,
  DrawerSection,
} from "@ui";
import { SizeType } from "@constants";
import { getUniqueId } from "@utils";
import {
  editIcon,
  deleteIcon,
  duplicateIcon,
  arrowUpIcon,
  arrowDownIcon,
} from "@icons";
import { getInitialState } from "@common/index";

export { getInitialState };

function SectionTitle({ content, help }) {
  return (
    <div
      style={{
        marginBottom: 12,
        fontSize: 16,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      <Label content={content} help={help} />
    </div>
  );
}

function SubSectionHeading({ content, help }) {
  return (
    <div
      style={{ paddingTop: 8, marginBottom: 12, fontSize: 14, fontWeight: 700 }}
    >
      <Label content={content} help={help} />
    </div>
  );
}

function FontSizeSettingItem({
  label,
  value,
  min,
  max,
  step,
  onChange,
  showCompact,
  compactPreview,
  compactHelpText,
  compactLabel,
  compactCustomEnabled,
  onCompactCustomChange,
  compactValue,
  compactMin,
  compactMax,
  onCompactValueChange,
}) {
  return (
    <>
      <SettingItem>
        <Label content={label} help="Size in pixels." />
        <div>
          <NumberInput
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
          />
          {showCompact ? (
            <div
              style={{ fontSize: 12, color: "#565656", marginTop: 4 }}
            >{`Compact: ${compactPreview}px`}</div>
          ) : null}
        </div>
      </SettingItem>
      {showCompact ? (
        <>
          <SettingItem>
            <Label content={compactLabel} help={compactHelpText} />
            <Checkbox
              value={compactCustomEnabled}
              onChange={onCompactCustomChange}
              label="Custom"
            />
          </SettingItem>
          {compactCustomEnabled ? (
            <SettingItem>
              <Label content={compactLabel} />
              <NumberInput
                value={compactValue}
                min={compactMin}
                max={compactMax}
                step={step}
                onChange={onCompactValueChange}
              />
            </SettingItem>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function SettingRow({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: 12,
        alignItems: "start",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function RadioChoice({ name, value, checked, onChange, label }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span>{label}</span>
    </label>
  );
}

function sanitizeSingleLineText(value) {
  return String(value || "").replace(/[\r\n]+/g, " ");
}

function duplicateItemWithNewIds(item) {
  return {
    ...item,
    id: getUniqueId(),
    bullets: Array.isArray(item?.bullets)
      ? item.bullets.map((bullet) => ({
          ...bullet,
          id: getUniqueId(),
        }))
      : [],
  };
}

const fontWeightOptions = [
  { value: 300, text: "Light (300)" },
  { value: 400, text: "Regular (400)" },
  { value: 500, text: "Medium (500)" },
  { value: 600, text: "Semibold (600)" },
  { value: 700, text: "Bold (700)" },
  { value: 800, text: "Extra Bold (800)" },
];

function Settings({ state, setState }) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);
  const [draggedBulletId, setDraggedBulletId] = useState(null);
  const [dragOverBulletId, setDragOverBulletId] = useState(null);

  const selectedItem = useMemo(
    () => state.items.find((item) => item.id === selectedItemId) || null,
    [state.items, selectedItemId],
  );

  const selectedItemIndex = useMemo(
    () => state.items.findIndex((item) => item.id === selectedItemId),
    [state.items, selectedItemId],
  );

  const updateItem = (itemId, updates) => {
    setState({
      ...state,
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    });
  };

  const deleteItem = (itemId) => {
    const nextItems = state.items.filter((item) => item.id !== itemId);
    setState({ ...state, items: nextItems });
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const duplicateItem = (itemId) => {
    const itemIndex = state.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    const itemToDuplicate = state.items[itemIndex];
    const duplicatedItem = duplicateItemWithNewIds(itemToDuplicate);

    const nextItems = [...state.items];
    nextItems.splice(itemIndex + 1, 0, duplicatedItem);
    setState({ ...state, items: nextItems });
    setSelectedItemId(duplicatedItem.id);
  };

  const reorderItems = (sourceItemId, targetItemId) => {
    if (!sourceItemId || !targetItemId || sourceItemId === targetItemId) {
      return;
    }

    const sourceIndex = state.items.findIndex(
      (item) => item.id === sourceItemId,
    );
    const targetIndex = state.items.findIndex(
      (item) => item.id === targetItemId,
    );

    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    const nextItems = [...state.items];
    const [movedItem] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, movedItem);
    setState({ ...state, items: nextItems });
  };

  const addItem = () => {
    const newItem = {
      id: getUniqueId(),
      title: "New item",
      description: "Add a short explanation for this step.",
      numberBgColor: state.numberBgColor || "#111827",
      numberTextColor: state.numberTextColor || "#ffffff",
      bulletListStyle: "bullets",
      bullets: [],
    };
    setState({ ...state, items: [...state.items, newItem] });
    setSelectedItemId(newItem.id);
  };

  const updateBullet = (itemId, bulletId, updates) => {
    setState({
      ...state,
      items: state.items.map((item) =>
        item.id !== itemId
          ? item
          : {
              ...item,
              bullets: (item.bullets || []).map((bullet) =>
                bullet.id === bulletId ? { ...bullet, ...updates } : bullet,
              ),
            },
      ),
    });
  };

  const addBullet = (itemId) => {
    const newBullet = {
      id: getUniqueId(),
      text: "Add a supporting bullet point.",
    };

    setState({
      ...state,
      items: state.items.map((item) =>
        item.id !== itemId
          ? item
          : { ...item, bullets: [...(item.bullets || []), newBullet] },
      ),
    });
  };

  const deleteBullet = (itemId, bulletId) => {
    setState({
      ...state,
      items: state.items.map((item) =>
        item.id !== itemId
          ? item
          : {
              ...item,
              bullets: (item.bullets || []).filter(
                (bullet) => bullet.id !== bulletId,
              ),
            },
      ),
    });
  };

  const duplicateBullet = (itemId, bulletId) => {
    const currentItem = state.items.find((item) => item.id === itemId);
    const bulletIndex =
      currentItem?.bullets?.findIndex((bullet) => bullet.id === bulletId) ?? -1;

    if (!currentItem || bulletIndex === -1) {
      return;
    }

    const bulletToDuplicate = currentItem.bullets[bulletIndex];
    const duplicatedBullet = {
      ...bulletToDuplicate,
      id: getUniqueId(),
    };

    setState({
      ...state,
      items: state.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const nextBullets = [...(item.bullets || [])];
        nextBullets.splice(bulletIndex + 1, 0, duplicatedBullet);
        return { ...item, bullets: nextBullets };
      }),
    });
  };

  const reorderBullets = (itemId, sourceBulletId, targetBulletId) => {
    if (!sourceBulletId || !targetBulletId || sourceBulletId === targetBulletId)
      return;
    setState({
      ...state,
      items: state.items.map((item) => {
        if (item.id !== itemId) return item;
        const bullets = [...(item.bullets || [])];
        const sourceIndex = bullets.findIndex((b) => b.id === sourceBulletId);
        const targetIndex = bullets.findIndex((b) => b.id === targetBulletId);
        if (sourceIndex === -1 || targetIndex === -1) return item;
        const [moved] = bullets.splice(sourceIndex, 1);
        bullets.splice(targetIndex, 0, moved);
        return { ...item, bullets };
      }),
    });
  };

  const moveBulletUp = (itemId, bulletId) => {
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;
    const index = (item.bullets || []).findIndex((b) => b.id === bulletId);
    if (index <= 0) return;
    const nextBullets = [...item.bullets];
    [nextBullets[index - 1], nextBullets[index]] = [
      nextBullets[index],
      nextBullets[index - 1],
    ];
    setState({
      ...state,
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, bullets: nextBullets } : i,
      ),
    });
  };

  const moveBulletDown = (itemId, bulletId) => {
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;
    const index = (item.bullets || []).findIndex((b) => b.id === bulletId);
    if (index === -1 || index >= (item.bullets || []).length - 1) return;
    const nextBullets = [...item.bullets];
    [nextBullets[index], nextBullets[index + 1]] = [
      nextBullets[index + 1],
      nextBullets[index],
    ];
    setState({
      ...state,
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, bullets: nextBullets } : i,
      ),
    });
  };

  const compactBreakpointWidth = state.widthBreakpoint || 520;
  const compactHelpText = `Used when the component's width is ${compactBreakpointWidth}px or below. To change the breakpoint, go to the Advanced tab.`;
  const autoTitleCompact = Math.max(10, Math.floor(state.titleFontSize * 0.85));
  const autoIntroCompact = Math.max(10, Math.floor(state.introFontSize * 0.85));
  const autoItemTitleCompact = Math.max(
    10,
    Math.floor(state.itemTitleFontSize * 0.85),
  );
  const autoItemDescCompact = Math.max(
    10,
    Math.floor(state.itemDescriptionFontSize * 0.85),
  );
  const effectiveTitleCompact =
    state.titleFontSizeCompactCustom && state.titleFontSizeCompact != null
      ? state.titleFontSizeCompact
      : autoTitleCompact;
  const effectiveIntroCompact =
    state.introFontSizeCompactCustom && state.introFontSizeCompact != null
      ? state.introFontSizeCompact
      : autoIntroCompact;
  const effectiveItemTitleCompact =
    state.itemTitleFontSizeCompactCustom &&
    state.itemTitleFontSizeCompact != null
      ? state.itemTitleFontSizeCompact
      : autoItemTitleCompact;
  const effectiveItemDescCompact =
    state.itemDescriptionFontSizeCompactCustom &&
    state.itemDescriptionFontSizeCompact != null
      ? state.itemDescriptionFontSizeCompact
      : autoItemDescCompact;

  return (
    <>
      <Tabs defaultActiveTab="content">
        <Tab id="content" title="Content">
          <Section>
            <SectionTitle
              content="Header"
              help="Control the optional intro section that appears above the numbered list."
            />
            <SettingItem>
              <Label
                content="Intro section"
                help="Display the title and description above the numbered list."
              />
              <Checkbox
                value={state.showIntroSection}
                onChange={(showIntroSection) =>
                  setState({ ...state, showIntroSection })
                }
                label="Show"
              />
            </SettingItem>

            {state.showIntroSection ? (
              <>
                <SettingItem>
                  <Label
                    content="Title"
                    help="Displayed above the numbered list when the intro section is enabled."
                  />
                  <TextInput
                    value={state.title}
                    onChange={(e) =>
                      setState({ ...state, title: e.currentTarget.value })
                    }
                  />
                </SettingItem>

                <SettingItem>
                  <Label
                    content="Description"
                    help="Optional supporting copy shown below the title."
                  />
                  <TextInput
                    value={state.introText}
                    onChange={(e) =>
                      setState({ ...state, introText: e.currentTarget.value })
                    }
                  />
                </SettingItem>
              </>
            ) : null}
          </Section>

          <Section>
            <SectionTitle
              content="Item table"
              help="Manage the numbered items here. You can add, edit, duplicate, delete, and reorder items from this table."
            />
            <SettingItem>
              <Label
                content="Items"
                help="Each item is editable from the Content > Item table. Use the menu to edit, duplicate, or delete an item, or add a new one below."
              />
              <TableContainer
                addButtonText="Add item"
                addButtonTitle="Add a new numbered item"
                emptyMessage="No list items added yet."
                columns={[
                  { content: "", compact: true },
                  { content: "Number" },
                  { content: "", compact: true },
                ]}
                onAdd={addItem}
                rows={state.items.map((item, index) => [
                  <div
                    key={`${item.id}-drag`}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", item.id);
                      setDraggedItemId(item.id);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      if (dragOverItemId !== item.id) {
                        setDragOverItemId(item.id);
                      }
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const sourceItemId =
                        event.dataTransfer.getData("text/plain") ||
                        draggedItemId;
                      reorderItems(sourceItemId, item.id);
                      setDraggedItemId(null);
                      setDragOverItemId(null);
                    }}
                    onDragEnd={() => {
                      setDraggedItemId(null);
                      setDragOverItemId(null);
                    }}
                    title="Drag to reorder"
                    style={{
                      cursor: "grab",
                      userSelect: "none",
                      fontWeight: 700,
                      textAlign: "center",
                      padding: "6px 8px",
                      borderRadius: 6,
                      border:
                        item.id === dragOverItemId
                          ? "1px dashed #6b7280"
                          : "1px dashed transparent",
                      background:
                        item.id === draggedItemId ? "#f3f4f6" : "transparent",
                    }}
                  >
                    ::
                  </div>,
                  <div
                    key={`${item.id}-number`}
                    style={{ textAlign: "center", fontWeight: 600 }}
                  >
                    {index + 1}
                  </div>,
                  <OptionsMenuRootButton
                    key={`${item.id}-menu`}
                    options={[
                      {
                        text: "Edit",
                        tip: "Edit this item",
                        icon: editIcon,
                        type: "onClick",
                        onClick: () => setSelectedItemId(item.id),
                      },
                      {
                        text: "Duplicate",
                        tip: "Duplicate this item",
                        icon: duplicateIcon,
                        type: "onClick",
                        onClick: () => duplicateItem(item.id),
                      },
                      {
                        text: "Delete",
                        tip: "Delete this item",
                        icon: deleteIcon,
                        type: "onClick",
                        onClick: () => deleteItem(item.id),
                      },
                    ]}
                  />,
                ])}
              />
            </SettingItem>
          </Section>
        </Tab>

        <Tab id="style" title="Style">
          <Section>
            <SectionTitle
              content="Typography"
              help="Choose the font families used across the header, item titles, item descriptions, and circled numbers."
            />
            <SettingRow>
              <SettingItem>
                <Label
                  content="Heading font family"
                  help="Used for the section title, item titles, and the numbers inside the circles."
                />
                <FontSelector
                  value={state.headingFontFamily}
                  onChange={(headingFontFamily) =>
                    setState({ ...state, headingFontFamily })
                  }
                />
              </SettingItem>

              <SettingItem>
                <Label
                  content="Heading font weight"
                  help="Controls the weight used for the section title, item titles, and the circled numbers."
                />
                <Dropdown
                  value={state.headingFontWeight}
                  options={fontWeightOptions}
                  onChange={(headingFontWeight) =>
                    setState({ ...state, headingFontWeight })
                  }
                />
              </SettingItem>
            </SettingRow>

            <SettingRow>
              <SettingItem>
                <Label
                  content="Body font family"
                  help="Used for the section description and each item description."
                />
                <FontSelector
                  value={state.bodyFontFamily}
                  onChange={(bodyFontFamily) =>
                    setState({ ...state, bodyFontFamily })
                  }
                />
              </SettingItem>

              <SettingItem>
                <Label
                  content="Body font weight"
                  help="Controls the weight used for the section description and item descriptions."
                />
                <Dropdown
                  value={state.bodyFontWeight}
                  options={fontWeightOptions}
                  onChange={(bodyFontWeight) =>
                    setState({ ...state, bodyFontWeight })
                  }
                />
              </SettingItem>
            </SettingRow>
          </Section>

          <Section>
            <SectionTitle
              content="Header"
              help="Style the optional header shown above the numbered list."
            />

            <SubSectionHeading content="Title" />

            <FontSizeSettingItem
              label="Size"
              value={state.titleFontSize}
              min={12}
              max={72}
              step={1}
              onChange={(titleFontSize) =>
                setState({ ...state, titleFontSize })
              }
              showCompact={state.hasWidthBreakpoint}
              compactPreview={effectiveTitleCompact}
              compactHelpText={compactHelpText}
              compactLabel="Compact size"
              compactCustomEnabled={state.titleFontSizeCompactCustom}
              onCompactCustomChange={(enabled) =>
                setState({
                  ...state,
                  titleFontSizeCompactCustom: enabled,
                  titleFontSizeCompact: enabled
                    ? (state.titleFontSizeCompact ?? autoTitleCompact)
                    : null,
                })
              }
              compactValue={state.titleFontSizeCompact ?? autoTitleCompact}
              compactMin={10}
              compactMax={72}
              onCompactValueChange={(titleFontSizeCompact) =>
                setState({ ...state, titleFontSizeCompact })
              }
            />

            <SettingItem>
              <Label content="Color" />
              <ColorPicker
                value={state.titleColor}
                onChange={(titleColor) => setState({ ...state, titleColor })}
              />
            </SettingItem>

            <SubSectionHeading content="Description" />

            <FontSizeSettingItem
              label="Size"
              value={state.introFontSize}
              min={10}
              max={40}
              step={1}
              onChange={(introFontSize) =>
                setState({ ...state, introFontSize })
              }
              showCompact={state.hasWidthBreakpoint}
              compactPreview={effectiveIntroCompact}
              compactHelpText={compactHelpText}
              compactLabel="Compact size"
              compactCustomEnabled={state.introFontSizeCompactCustom}
              onCompactCustomChange={(enabled) =>
                setState({
                  ...state,
                  introFontSizeCompactCustom: enabled,
                  introFontSizeCompact: enabled
                    ? (state.introFontSizeCompact ?? autoIntroCompact)
                    : null,
                })
              }
              compactValue={state.introFontSizeCompact ?? autoIntroCompact}
              compactMin={10}
              compactMax={40}
              onCompactValueChange={(introFontSizeCompact) =>
                setState({ ...state, introFontSizeCompact })
              }
            />

            <SettingItem>
              <Label content="Color" />
              <ColorPicker
                value={state.introColor}
                onChange={(introColor) => setState({ ...state, introColor })}
              />
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle
              content="Item title"
              help="Style the title shown for each numbered item."
            />
            <FontSizeSettingItem
              label="Item title size"
              value={state.itemTitleFontSize}
              min={10}
              max={40}
              step={1}
              onChange={(itemTitleFontSize) =>
                setState({ ...state, itemTitleFontSize })
              }
              showCompact={state.hasWidthBreakpoint}
              compactPreview={effectiveItemTitleCompact}
              compactHelpText={compactHelpText}
              compactLabel="Compact item title size"
              compactCustomEnabled={state.itemTitleFontSizeCompactCustom}
              onCompactCustomChange={(enabled) =>
                setState({
                  ...state,
                  itemTitleFontSizeCompactCustom: enabled,
                  itemTitleFontSizeCompact: enabled
                    ? (state.itemTitleFontSizeCompact ?? autoItemTitleCompact)
                    : null,
                })
              }
              compactValue={
                state.itemTitleFontSizeCompact ?? autoItemTitleCompact
              }
              compactMin={10}
              compactMax={40}
              onCompactValueChange={(itemTitleFontSizeCompact) =>
                setState({ ...state, itemTitleFontSizeCompact })
              }
            />

            <SettingItem>
              <Label content="Item title color" />
              <ColorPicker
                value={state.itemTitleColor}
                onChange={(itemTitleColor) =>
                  setState({ ...state, itemTitleColor })
                }
              />
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle
              content="Item description"
              help="Style the supporting description and child list shown under each item title."
            />

            <FontSizeSettingItem
              label="Item description size"
              value={state.itemDescriptionFontSize}
              min={10}
              max={32}
              step={1}
              onChange={(itemDescriptionFontSize) =>
                setState({ ...state, itemDescriptionFontSize })
              }
              showCompact={state.hasWidthBreakpoint}
              compactPreview={effectiveItemDescCompact}
              compactHelpText={compactHelpText}
              compactLabel="Compact item description size"
              compactCustomEnabled={state.itemDescriptionFontSizeCompactCustom}
              onCompactCustomChange={(enabled) =>
                setState({
                  ...state,
                  itemDescriptionFontSizeCompactCustom: enabled,
                  itemDescriptionFontSizeCompact: enabled
                    ? (state.itemDescriptionFontSizeCompact ??
                      autoItemDescCompact)
                    : null,
                })
              }
              compactValue={
                state.itemDescriptionFontSizeCompact ?? autoItemDescCompact
              }
              compactMin={10}
              compactMax={32}
              onCompactValueChange={(itemDescriptionFontSizeCompact) =>
                setState({ ...state, itemDescriptionFontSizeCompact })
              }
            />

            <SettingItem>
              <Label content="Item description color" />
              <ColorPicker
                value={state.itemDescriptionColor}
                onChange={(itemDescriptionColor) =>
                  setState({ ...state, itemDescriptionColor })
                }
              />
            </SettingItem>

            <SettingItem>
              <Label
                content="Gap before child list"
                help="Spacing between an item description and its nested child list."
              />
              <NumberInput
                value={state.bulletListTopGap}
                min={0}
                max={48}
                step={1}
                onChange={(bulletListTopGap) =>
                  setState({ ...state, bulletListTopGap })
                }
              />
            </SettingItem>

            <SettingItem>
              <Label
                content="Gap between child items"
                help="Vertical spacing between items inside each nested child list."
              />
              <NumberInput
                value={state.bulletListGap}
                min={0}
                max={32}
                step={1}
                onChange={(bulletListGap) =>
                  setState({ ...state, bulletListGap })
                }
              />
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle
              content="Circled Numbers"
              help="Adjust the appearance and positioning of the circled number for each item."
            />
            <SettingItem>
              <Label
                content="Type"
                help="Filled uses the item circle color as a background. Outlined uses it as a border color."
              />
              <Dropdown
                value={state.circleStyleType}
                options={[
                  { value: "filled", text: "Filled" },
                  { value: "outlined", text: "Outlined" },
                ]}
                onChange={(circleStyleType) =>
                  setState({ ...state, circleStyleType })
                }
              />
            </SettingItem>

            {state.circleStyleType === "outlined" ? (
              <SettingItem>
                <Label
                  content="Line width"
                  help="Set the border width for outlined circles."
                />
                <NumberInput
                  value={state.circleOutlineWidth}
                  min={1}
                  max={12}
                  step={1}
                  onChange={(circleOutlineWidth) =>
                    setState({ ...state, circleOutlineWidth })
                  }
                />
              </SettingItem>
            ) : null}

            <SettingItem>
              <Label content="Number circle size" help="Diameter in pixels." />
              <NumberInput
                value={state.numberSize}
                min={20}
                max={100}
                step={1}
                onChange={(numberSize) => setState({ ...state, numberSize })}
              />
            </SettingItem>

            <SettingItem>
              <Label
                content="Number horizontal offset"
                help="Move the number left or right inside the circle. Negative values move left, positive values move right."
              />
              <NumberInput
                value={state.numberOffsetX}
                min={-20}
                max={20}
                step={1}
                onChange={(numberOffsetX) =>
                  setState({ ...state, numberOffsetX })
                }
              />
            </SettingItem>

            <SettingItem>
              <Label
                content="Number vertical offset"
                help="Move the number up or down inside the circle. Negative values move up, positive values move down."
              />
              <NumberInput
                value={state.numberOffsetY}
                min={-20}
                max={20}
                step={1}
                onChange={(numberOffsetY) =>
                  setState({ ...state, numberOffsetY })
                }
              />
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle
              content="Container"
              help="Control the card surfaces, overall spacing, and layout alignment for the numbered list."
            />
            <SettingItem>
              <Label content="Card background color" />
              <ColorPicker
                value={state.sectionBackgroundColor}
                onChange={(sectionBackgroundColor) =>
                  setState({ ...state, sectionBackgroundColor })
                }
              />
            </SettingItem>

            <SettingItem>
              <Label
                content="Gap between items"
                help="Vertical spacing in pixels."
              />
              <NumberInput
                value={state.itemGap}
                min={0}
                max={48}
                step={1}
                onChange={(itemGap) => setState({ ...state, itemGap })}
              />
            </SettingItem>

            <SettingItem>
              <Label
                content="Item alignment"
                help="Align the circled number and the content block to the top, middle, or bottom of each row."
              />
              <Dropdown
                value={state.itemContentAlignment}
                options={[
                  { value: "start", text: "Start" },
                  { value: "center", text: "Middle" },
                  { value: "end", text: "End" },
                ]}
                onChange={(itemContentAlignment) =>
                  setState({ ...state, itemContentAlignment })
                }
              />
            </SettingItem>

            <SettingItem>
              <Label
                content="Padding left and right"
                help="Horizontal padding around the whole component."
              />
              <NumberInput
                value={state.sectionPaddingX}
                min={0}
                max={80}
                step={1}
                onChange={(sectionPaddingX) =>
                  setState({ ...state, sectionPaddingX })
                }
              />
            </SettingItem>

            <SettingItem>
              <Label
                content="Padding top and bottom"
                help="Vertical padding around the whole component."
              />
              <NumberInput
                value={state.sectionPaddingY}
                min={0}
                max={80}
                step={1}
                onChange={(sectionPaddingY) =>
                  setState({ ...state, sectionPaddingY })
                }
              />
            </SettingItem>
          </Section>
        </Tab>

        <Tab id="advanced" title="Advanced">
          <Section>
            <SectionTitle
              content="Responsive Width"
              help="Controls how the component responds to its own container width."
            />
            <SettingItem>
              <Label
                content="Enable width breakpoint"
                help="When enabled, the component switches to a compact layout when its width reaches or falls below the breakpoint value."
              />
              <Checkbox
                value={state.hasWidthBreakpoint}
                onChange={(hasWidthBreakpoint) =>
                  setState({ ...state, hasWidthBreakpoint })
                }
                label="Enable"
              />
            </SettingItem>
            {state.hasWidthBreakpoint ? (
              <>
                <SettingItem>
                  <Label
                    content="Breakpoint width"
                    help="When the component width reaches this value or below, it switches to a compact layout. Current width is shown in the live view when the preview toggle is on."
                  />
                  <NumberInput
                    value={state.widthBreakpoint}
                    min={120}
                    max={2000}
                    step={1}
                    onChange={(widthBreakpoint) =>
                      setState({ ...state, widthBreakpoint })
                    }
                  />
                </SettingItem>
                <SettingItem>
                  <Checkbox
                    value={state.previewWidthInLiveView}
                    onChange={(previewWidthInLiveView) =>
                      setState({ ...state, previewWidthInLiveView })
                    }
                    label="Preview width in live view"
                  />
                </SettingItem>
              </>
            ) : null}
          </Section>
          <Section>
            <SectionTitle
              content="Animation"
              help="Configure optional list animations and expose manual playback through the Start Animation action."
            />

            <SettingItem>
              <Label
                content="Animation style"
                help="Choose how the list animates. Number wave scales the circles from top to bottom. Fade in items reveals each row in sequence."
              />
              <Dropdown
                value={state.animationStyle}
                options={[
                  { value: "none", text: "None" },
                  { value: "number-wave", text: "Number wave" },
                  { value: "fade-items", text: "Fade in items" },
                ]}
                onChange={(animationStyle) =>
                  setState({ ...state, animationStyle })
                }
              />
            </SettingItem>

            {state.animationStyle !== "none" ? (
              <>
                <SettingItem>
                  <Label
                    content="Duration"
                    help="Animation time in milliseconds for each item."
                  />
                  <NumberInput
                    value={state.animationDuration}
                    min={100}
                    max={5000}
                    step={50}
                    onChange={(animationDuration) =>
                      setState({ ...state, animationDuration })
                    }
                  />
                </SettingItem>

                <SettingItem>
                  <Label
                    content="Stagger"
                    help="Delay in milliseconds between each animated item."
                  />
                  <NumberInput
                    value={state.animationStagger}
                    min={0}
                    max={2000}
                    step={10}
                    onChange={(animationStagger) =>
                      setState({ ...state, animationStagger })
                    }
                  />
                </SettingItem>
              </>
            ) : null}

            {state.animationStyle !== "none" ? (
              <>
                <SettingItem>
                  <Label
                    content="Playback mode"
                    help="Choose whether the animation runs automatically on load or only when triggered manually through the Start Animation action."
                  />
                  <Dropdown
                    value={state.animationPlaybackMode || "auto"}
                    options={[
                      { value: "auto", text: "Auto play on load" },
                      { value: "manual", text: "Manual trigger" },
                    ]}
                    onChange={(animationPlaybackMode) =>
                      setState({ ...state, animationPlaybackMode })
                    }
                  />
                </SettingItem>
                {state.animationPlaybackMode === "manual" ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 6,
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      color: "#6b80c5",
                      fontSize: 13,
                      lineHeight: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    <span>
                      The animation will not play automatically. Use the{" "}
                      <b>Start Animation</b> action to trigger it externally.
                    </span>
                  </div>
                ) : null}
              </>
            ) : null}
          </Section>
        </Tab>
      </Tabs>

      <Drawer
        isOpen={Boolean(selectedItem)}
        onClose={() => {
          setSelectedItemId(null);
        }}
        title="Edit list item"
        width={520}
      >
        {selectedItem ? (
          <>
            <DrawerSection>
              <SectionTitle
                content={`Item ${selectedItemIndex + 1}`}
                help="This shows which list item you are currently editing."
              />
              <SectionTitle
                content="Item content"
                help="Edit the text shown for this numbered item."
              />
              <SettingItem>
                <Label content="Item title" />
                <TextInput
                  value={selectedItem.title}
                  onChange={(e) =>
                    updateItem(selectedItem.id, {
                      title: e.currentTarget.value,
                    })
                  }
                />
              </SettingItem>

              <SettingItem>
                <Label content="Item description" />
                <textarea
                  value={selectedItem.description}
                  rows={4}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                  onChange={(e) =>
                    updateItem(selectedItem.id, {
                      description: sanitizeSingleLineText(
                        e.currentTarget.value,
                      ),
                    })
                  }
                  style={{
                    width: "100%",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </SettingItem>
            </DrawerSection>

            <DrawerSection>
              <SectionTitle
                content="Circle colors"
                help="Set the circle and number colors for this specific item."
              />
              <SettingItem>
                <Label
                  content="Number background color"
                  help="Set the circle color for this specific number."
                />
                <ColorPicker
                  value={selectedItem.numberBgColor || "#111827"}
                  onChange={(numberBgColor) =>
                    updateItem(selectedItem.id, { numberBgColor })
                  }
                />
              </SettingItem>

              <SettingItem>
                <Label
                  content="Number text color"
                  help="Set the text color for this specific number."
                />
                <ColorPicker
                  value={selectedItem.numberTextColor || "#ffffff"}
                  onChange={(numberTextColor) =>
                    updateItem(selectedItem.id, { numberTextColor })
                  }
                />
              </SettingItem>
            </DrawerSection>

            <DrawerSection>
              <SectionTitle
                content="Bullet list"
                help="Add optional supporting bullet points under this numbered item."
              />
              <SettingItem>
                <Label
                  content="List style"
                  help="Choose how the nested list markers are displayed for this item."
                />
                <Dropdown
                  value={
                    selectedItem.bulletListStyle === "alpha"
                      ? "alphabetical"
                      : selectedItem.bulletListStyle || "bullets"
                  }
                  options={[
                    { value: "bullets", text: "Bullets" },
                    { value: "alphabetical", text: "Alphabetical" },
                    { value: "roman", text: "Roman numerals" },
                  ]}
                  onChange={(bulletListStyle) =>
                    updateItem(selectedItem.id, { bulletListStyle })
                  }
                />
              </SettingItem>
              <SettingItem>
                <Label
                  content="Bullet items"
                  help="Manage the nested bullet list for this numbered item."
                />
                <TableContainer
                  addButtonText="Add bullet"
                  addButtonTitle="Add a new bullet item"
                  emptyMessage="No bullet items added yet."
                  columns={[
                    { content: "", compact: true },
                    { content: "Bullet text" },
                    { content: "", compact: true },
                  ]}
                  onAdd={() => addBullet(selectedItem.id)}
                  rows={(selectedItem.bullets || []).map(
                    (bullet, bulletIndex) => [
                      <div
                        key={`${bullet.id}-drag`}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", bullet.id);
                          setDraggedBulletId(bullet.id);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                          if (dragOverBulletId !== bullet.id) {
                            setDragOverBulletId(bullet.id);
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const sourceBulletId =
                            event.dataTransfer.getData("text/plain") ||
                            draggedBulletId;
                          reorderBullets(
                            selectedItem.id,
                            sourceBulletId,
                            bullet.id,
                          );
                          setDraggedBulletId(null);
                          setDragOverBulletId(null);
                        }}
                        onDragEnd={() => {
                          setDraggedBulletId(null);
                          setDragOverBulletId(null);
                        }}
                        title="Drag to reorder"
                        style={{
                          cursor: "grab",
                          userSelect: "none",
                          fontWeight: 700,
                          textAlign: "center",
                          padding: "6px 8px",
                          borderRadius: 6,
                          border:
                            bullet.id === dragOverBulletId
                              ? "1px dashed #6b7280"
                              : "1px dashed transparent",
                          background:
                            bullet.id === draggedBulletId
                              ? "#f3f4f6"
                              : "transparent",
                        }}
                      >
                        ::
                      </div>,
                      <TextInput
                        key={`${bullet.id}-text`}
                        value={bullet.text}
                        onChange={(e) =>
                          updateBullet(selectedItem.id, bullet.id, {
                            text: sanitizeSingleLineText(e.currentTarget.value),
                          })
                        }
                      />,
                      <OptionsMenuRootButton
                        key={`${bullet.id}-menu`}
                        options={[
                          {
                            text: "Move up",
                            tip: "Move this bullet up",
                            icon: arrowUpIcon,
                            type: "onClick",
                            onClick: () =>
                              moveBulletUp(selectedItem.id, bullet.id),
                          },
                          {
                            text: "Move down",
                            tip: "Move this bullet down",
                            icon: arrowDownIcon,
                            type: "onClick",
                            onClick: () =>
                              moveBulletDown(selectedItem.id, bullet.id),
                          },
                          {
                            text: "Duplicate",
                            tip: "Duplicate this bullet item",
                            icon: duplicateIcon,
                            type: "onClick",
                            onClick: () =>
                              duplicateBullet(selectedItem.id, bullet.id),
                          },
                          {
                            text: "Delete",
                            tip: "Delete this bullet item",
                            icon: deleteIcon,
                            type: "onClick",
                            onClick: () =>
                              deleteBullet(selectedItem.id, bullet.id),
                          },
                        ]}
                      />,
                    ],
                  )}
                />
              </SettingItem>
            </DrawerSection>
          </>
        ) : null}
      </Drawer>
    </>
  );
}

export function getSettings(state) {
  return {
    settings: {
      name: "Numbered List",
      categories: ["Text", "Bullet List"],
      tags: [
        "Numbered List",
        "Step-by-Step List",
        "Process List",
        "Instruction List",
        "Ordered List",
        "Nested List",
        "Structured Content",
        "How-To Steps",
        "Checklist",
        "Hierarchical List",
      ],
      description:
        "A numbered list component ideal for step-by-step instructions and structured content that displays ordered items with optional nested sub-points and interactive elements.",
      Setting: Settings,
      width: 460,
      help: () => ({
        title: "Numbered List Help",
        content: (
          <>
            <h1>Numbered List</h1>
            <p>
              A numbered list component ideal for step-by-step instructions and
              structured content. Each item can include a title, description,
              and optional nested bullet list with support for bullets,
              alphabetical, or Roman numeral styles.
            </p>
            <h2>Content</h2>
            <p>
              Each item is editable in the Content &gt; Item table. You can add,
              edit, duplicate, delete, and reorder items, and each item can
              include its own child list.
            </p>
            <h2>Style</h2>
            <p>
              Use the Style tab to mirror the same mental model as Content:
              style the header first, then the item content, then the shared
              number and container controls.
            </p>
            <h2>Advanced</h2>
            <p>
              Configure optional list animations, including manual playback
              through the <b>Start Animation</b> action and completion handling
              through the <b>On Animation Complete</b> trigger. Enable a width
              breakpoint to apply compact font sizes when the component is
              narrower than a set threshold.
            </p>
            <hr style={{ margin: "20px 0" }} />
            <h2>Actions</h2>
            <ul>
              <li>
                <b>Start Animation</b> — Runs the configured list animation
                once.
              </li>
            </ul>
            <h2>Triggers</h2>
            <ul>
              <li>
                <b>On Animation Complete</b> — Fires when the list animation
                finishes, allowing external workflows or analytics to respond.
              </li>
            </ul>
          </>
        ),
      }),
    },
  };
}

export function getDataFields(state) {
  return {
    title: { name: "Title", type: "text" },
    introText: { name: "Description", type: "text" },
    items: { name: "Items", type: "list" },
  };
}

export function getActions(state) {
  return {
    runAnimation: {
      name: "Start Animation",
      info: { text: "Runs the configured list animation once." },
      state: {},
      Setting() {
        return (
          <SettingItem>
            <Label
              content="Playback"
              help="This action runs the animation configured in the Advanced tab."
            />
          </SettingItem>
        );
      },
    },
  };
}

export function getTriggers(state) {
  return {
    onAnimationComplete: { name: "On Animation Complete" },
  };
}

export function getFonts(state) {
  return [state.headingFontFamily, state.bodyFontFamily];
}

export function getSizeTypes(state) {
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
import React, { useEffect, useRef, useState } from "react";
import { ScopedStyle } from "@utils";
import { useScaler } from "@hooks";
import { getInitialState } from "@common/index";

export { getInitialState };

export function getActionHandlers() {
  return {
    async runAnimation({ setComponentState }) {
      setComponentState((prev) => ({
        ...prev,
        animationRunId: (prev.animationRunId || 0) + 1,
      }));
    },
  };
}

export function Component({ state, setState, saveAudienceData, runTrigger }) {
  const { s } = useScaler();
  const rootRef = useRef(null);
  const autoPlayRef = useRef(false);
  const animationTimeoutRef = useRef(null);
  const [animationNonce, setAnimationNonce] = useState(0);
  const [activeAnimationStyle, setActiveAnimationStyle] = useState("none");
  const scaledNumberSize = s(state.numberSize);
  const scaledNumberFontSize = s(
    Math.max(12, Math.round(state.numberSize * 0.42)),
  );
  const scaledCircleOutlineWidth = s(state.circleOutlineWidth || 0);
  const numberCenterX = scaledNumberSize / 2 + s(state.numberOffsetX || 0);
  const numberCenterY = scaledNumberSize / 2 + s(state.numberOffsetY || 0);
  const itemAlignment =
    state.itemContentAlignment === "center"
      ? "center"
      : state.itemContentAlignment === "end"
        ? "flex-end"
        : "flex-start";
  const animationDuration = Math.max(100, state.animationDuration || 700);
  const animationStagger = Math.max(0, state.animationStagger || 0);
  const itemCount = (state.items || []).length;

  const responsiveBreakpointWidth = Math.max(
    120,
    Number(state.widthBreakpoint) || 120,
  );
  const measuredWidth = Math.max(0, Number(state.currentComponentWidth) || 0);
  const isCompactLayout =
    Boolean(state.hasWidthBreakpoint) &&
    measuredWidth > 0 &&
    measuredWidth <= responsiveBreakpointWidth;

  const activeTitleFontSize = isCompactLayout
    ? state.titleFontSizeCompactCustom && state.titleFontSizeCompact != null
      ? state.titleFontSizeCompact
      : Math.max(10, Math.floor(state.titleFontSize * 0.85))
    : state.titleFontSize;
  const activeIntroFontSize = isCompactLayout
    ? state.introFontSizeCompactCustom && state.introFontSizeCompact != null
      ? state.introFontSizeCompact
      : Math.max(10, Math.floor(state.introFontSize * 0.85))
    : state.introFontSize;
  const activeItemTitleFontSize = isCompactLayout
    ? state.itemTitleFontSizeCompactCustom &&
      state.itemTitleFontSizeCompact != null
      ? state.itemTitleFontSizeCompact
      : Math.max(10, Math.floor(state.itemTitleFontSize * 0.85))
    : state.itemTitleFontSize;
  const activeItemDescFontSize = isCompactLayout
    ? state.itemDescriptionFontSizeCompactCustom &&
      state.itemDescriptionFontSizeCompact != null
      ? state.itemDescriptionFontSizeCompact
      : Math.max(10, Math.floor(state.itemDescriptionFontSize * 0.85))
    : state.itemDescriptionFontSize;
  const toAlphabeticalMarker = (value) => {
    let number = value;
    let result = "";

    while (number > 0) {
      const remainder = (number - 1) % 26;
      result = String.fromCharCode(97 + remainder) + result;
      number = Math.floor((number - 1) / 26);
    }

    return `${result}.`;
  };

  const toRomanMarker = (value) => {
    const numerals = [
      ["m", 1000],
      ["cm", 900],
      ["d", 500],
      ["cd", 400],
      ["c", 100],
      ["xc", 90],
      ["l", 50],
      ["xl", 40],
      ["x", 10],
      ["ix", 9],
      ["v", 5],
      ["iv", 4],
      ["i", 1],
    ];
    let number = value;
    let result = "";

    numerals.forEach(([symbol, amount]) => {
      while (number >= amount) {
        result += symbol;
        number -= amount;
      }
    });

    return `${result}.`;
  };

  const getBulletMarker = (item, bulletIndex) => {
    switch (item?.bulletListStyle) {
      case "alphabetical":
      case "alpha":
        return toAlphabeticalMarker(bulletIndex + 1);
      case "roman":
        return toRomanMarker(bulletIndex + 1);
      default:
        return "\u2022";
    }
  };

  const startAnimation = () => {
    if (!state.animationStyle || state.animationStyle === "none") {
      return;
    }

    setActiveAnimationStyle(state.animationStyle);
    setAnimationNonce((prev) => prev + 1);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(
      () => {
        runTrigger("onAnimationComplete");
      },
      animationDuration + Math.max(0, itemCount - 1) * animationStagger,
    );
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const sync = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      setState((prev) => {
        if (
          prev.currentComponentWidth === w &&
          prev.currentComponentHeight === h
        )
          return prev;
        return { ...prev, currentComponentWidth: w, currentComponentHeight: h };
      });
    };

    sync();
    const frameId = requestAnimationFrame(sync);
    const frameId2 = requestAnimationFrame(() => requestAnimationFrame(sync));

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(sync);
      observer.observe(el);
    }

    return () => {
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(frameId2);
      if (observer) observer.disconnect();
    };
  }, [setState]);

  useEffect(() => {
    if (state.animationStyle === "none") {
      setActiveAnimationStyle("none");
    }
  }, [state.animationStyle]);

  useEffect(() => {
    if (
      state.animationPlaybackMode !== "auto" ||
      autoPlayRef.current ||
      state.animationStyle === "none"
    ) {
      return;
    }

    autoPlayRef.current = true;
    startAnimation();
  }, [state.animationPlaybackMode, state.animationStyle]);

  useEffect(() => {
    if (!state.animationRunId) {
      return;
    }

    startAnimation();
  }, [state.animationRunId]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const styles = `
    .numbered-list-root,
    .numbered-list-root *,
    .numbered-list-root *::before,
    .numbered-list-root *::after {
      box-sizing: border-box;
    }

    .numbered-list-root {
      position: relative;
      width: 100%;
      height: 100%;
      background: ${state.sectionBackgroundColor};
      padding: ${s(state.sectionPaddingY || 0)}px ${s(state.sectionPaddingX || 0)}px;
      font-family: ${state.bodyFontFamily};
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: auto;
    }

    .numbered-list-inner {
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .numbered-list-title {
      margin: 0 0 ${s(8)}px 0;
      font-family: ${state.headingFontFamily};
      color: ${state.titleColor};
      font-size: ${s(activeTitleFontSize)}px;
      line-height: 1.2;
      font-weight: ${state.headingFontWeight};
    }

    .numbered-list-intro {
      margin: 0 0 ${s(18)}px 0;
      font-family: ${state.bodyFontFamily};
      color: ${state.introColor};
      font-size: ${s(activeIntroFontSize)}px;
      line-height: 1.5;
      font-weight: ${state.bodyFontWeight};
    }

    .numbered-list-items {
      display: flex;
      flex-direction: column;
      gap: ${s(state.itemGap)}px;
      width: 100%;
    }

    .numbered-list-item {
      width: 100%;
      display: flex;
      align-items: ${itemAlignment};
      gap: ${s(14)}px;
      padding: 0;
      background: ${state.cardBackgroundColor};
      border: none;
      border-radius: ${s(12)}px;
    }

    .numbered-list-circle {
      flex: 0 0 ${scaledNumberSize}px;
      position: relative;
      overflow: hidden;
      width: ${scaledNumberSize}px;
      height: ${scaledNumberSize}px;
      border-radius: 50%;
      border-style: solid;
      border-color: transparent;
    }

    .numbered-list-circle-svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
    }

    .numbered-list-content {
      flex: 1 1 auto;
      width: 100%;
    }

    .numbered-list-item-title {
      margin: 0 0 ${s(6)}px 0;
      font-family: ${state.headingFontFamily};
      color: ${state.itemTitleColor};
      font-size: ${s(activeItemTitleFontSize)}px;
      line-height: 1.3;
      font-weight: ${state.headingFontWeight};
    }

    .numbered-list-item-description {
      margin: 0;
      font-family: ${state.bodyFontFamily};
      color: ${state.itemDescriptionColor};
      font-size: ${s(activeItemDescFontSize)}px;
      line-height: 1.5;
      font-weight: ${state.bodyFontWeight};
    }

    .numbered-list-bullets {
      margin: ${s(state.bulletListTopGap || 0)}px 0 0 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: ${s(state.bulletListGap || 0)}px;
      color: ${state.itemDescriptionColor};
    }

    .numbered-list-bullet-item {
      margin: 0;
      display: flex;
      align-items: flex-start;
      gap: ${s(8)}px;
      font-family: ${state.bodyFontFamily};
      font-size: ${s(activeItemDescFontSize)}px;
      line-height: 1.5;
      font-weight: ${state.bodyFontWeight};
    }

    .numbered-list-bullet-marker {
      flex: 0 0 auto;
      min-width: ${s(18)}px;
      text-align: right;
    }

    .numbered-list-bullet-text {
      flex: 1 1 auto;
      min-width: 0;
    }

    .numbered-list-items.is-fade-items .numbered-list-item {
      opacity: 0;
      transform: translateY(${s(12)}px);
      animation: numbered-list-fade-in ${animationDuration}ms ease forwards;
    }

    .numbered-list-items.is-number-wave .numbered-list-circle {
      transform: scale(0.72);
      animation: numbered-list-number-wave ${animationDuration}ms ease forwards;
      transform-origin: center center;
    }

    @keyframes numbered-list-fade-in {
      0% {
        opacity: 0;
        transform: translateY(${s(12)}px);
      }

      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes numbered-list-number-wave {
      0% {
        transform: scale(0.72);
      }

      45% {
        transform: scale(1.08);
      }

      100% {
        transform: scale(1);
      }
    }
  `;

  return (
    <>
      <ScopedStyle>{styles}</ScopedStyle>
      <div ref={rootRef} className="numbered-list-root">
        {state.previewWidthInLiveView && state.currentComponentWidth > 0 ? (
          <div
            style={{
              position: "absolute",
              top: `${s(12)}px`,
              right: `${s(12)}px`,
              zIndex: 2,
              boxSizing: "border-box",
              padding: `${s(6)}px ${s(10)}px`,
              borderRadius: `${s(999)}px`,
              background: "rgba(17, 24, 39, 0.78)",
              color: "#ffffff",
              fontSize: `${s(12)}px`,
              fontWeight: 600,
              lineHeight: 1,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {state.currentComponentWidth}px
          </div>
        ) : null}
        <div className="numbered-list-inner">
          {state.showIntroSection && state.title ? (
            <h2 className="numbered-list-title">{state.title}</h2>
          ) : null}

          {state.showIntroSection && state.introText ? (
            <p className="numbered-list-intro">{state.introText}</p>
          ) : null}

          <div
            key={animationNonce}
            className={`numbered-list-items ${
              activeAnimationStyle === "fade-items"
                ? "is-fade-items"
                : activeAnimationStyle === "number-wave"
                  ? "is-number-wave"
                  : ""
            }`}
          >
            {(state.items || []).map((item, index) =>
              (() => {
                const circleColor =
                  item.numberBgColor || state.numberBgColor || "#111827";
                const circleStyle =
                  state.circleStyleType === "outlined"
                    ? {
                        background: "transparent",
                        borderColor: circleColor,
                        borderWidth: `${scaledCircleOutlineWidth}px`,
                      }
                    : {
                        background: circleColor,
                        borderWidth: "0px",
                      };

                return (
                  <div
                    key={item.id || index}
                    className="numbered-list-item"
                    style={
                      activeAnimationStyle === "fade-items"
                        ? { animationDelay: `${index * animationStagger}ms` }
                        : undefined
                    }
                  >
                    <div
                      className="numbered-list-circle"
                      style={{
                        ...circleStyle,
                        animationDelay:
                          activeAnimationStyle === "number-wave"
                            ? `${index * animationStagger}ms`
                            : undefined,
                      }}
                      aria-hidden="true"
                      title={`Item ${index + 1}`}
                    >
                      <svg
                        className="numbered-list-circle-svg"
                        viewBox={`0 0 ${scaledNumberSize} ${scaledNumberSize}`}
                        aria-hidden="true"
                        focusable="false"
                      >
                        <text
                          x={numberCenterX}
                          y={numberCenterY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={
                            item.numberTextColor ||
                            state.numberTextColor ||
                            "#ffffff"
                          }
                          fontFamily={state.headingFontFamily}
                          fontSize={scaledNumberFontSize}
                          fontWeight={state.headingFontWeight}
                        >
                          {index + 1}
                        </text>
                      </svg>
                    </div>
                    <div className="numbered-list-content">
                      <h3 className="numbered-list-item-title">{item.title}</h3>
                      <p className="numbered-list-item-description">
                        {item.description}
                      </p>
                      {(item.bullets || []).length ? (
                        <div className="numbered-list-bullets" role="list">
                          {item.bullets.map((bullet, bulletIndex) => (
                            <div
                              key={bullet.id || bulletIndex}
                              className="numbered-list-bullet-item"
                              role="listitem"
                            >
                              <span className="numbered-list-bullet-marker">
                                {getBulletMarker(item, bulletIndex)}
                              </span>
                              <span className="numbered-list-bullet-text">
                                {bullet.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })(),
            )}
          </div>
        </div>
      </div>
    </>
  );
}
```

END
