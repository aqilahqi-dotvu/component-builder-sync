---
name: scroll-runtime
description: "Pattern for scroll-reliant Dot.vu components that must work in the AI builder and Preview Mode — resolve the effective scroll container, compute progress relative to that viewport, and keep editor preview behavior separate when needed."
---

# Scroll Runtime

Use this skill when a component's behavior depends on scroll position — for example, reveal text, scrub an animation, drive a progress value, pin sticky content, or trigger state changes as the user scrolls.

Read first: [dotvu-component.instructions.md](../../instructions/dotvu-component.instructions.md) and the three runtime files.

---

## Why this skill exists

Dot.vu components often run in more than one viewport context:

- the live Preview Mode page
- the AI builder or editor canvas
- nested iframe or scroll-container environments

A scroll-driven component must not assume the active scroll source is always `window`. In builder-style canvases, the scrollable viewport may be a parent element instead.

If the component listens only to `window.scroll`, the scroll animation may work in Preview Mode but appear stuck in the builder.

---

## Core rules

1. Treat scroll source detection as part of the runtime behavior, not as an editor-only workaround.
2. In `live.js`, resolve the effective scroll container for the component root before attaching listeners.
3. Fall back to `window` only when no scrollable ancestor is found.
4. When the scroll source is an element, compute progress relative to that element's viewport, not `window.innerHeight`.
5. Throttle scroll updates with `requestAnimationFrame`.
6. Keep builder preview behavior separate from true scroll behavior. If the component has a Preview Animation button, it should not replace the real scroll-linked logic.

---

## Detect the real scroll source

Start from the component container ref in `live.js` and walk up through `parentElement` until you find an ancestor whose overflow and scroll height indicate that it can scroll.

Example pattern:

```js
const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;

function isScrollableElement(element) {
  if (!element || typeof window === "undefined") return false;

  const styles = window.getComputedStyle(element);
  const overflowY = styles.overflowY || styles.overflow;

  return (
    SCROLLABLE_OVERFLOW_PATTERN.test(overflowY) &&
    element.scrollHeight > element.clientHeight + 1
  );
}

function getScrollSource(element) {
  if (!element || typeof window === "undefined") {
    return { isWindow: true, node: window };
  }

  let current = element.parentElement;

  while (current) {
    if (isScrollableElement(current)) {
      return { isWindow: false, node: current };
    }
    current = current.parentElement;
  }

  return { isWindow: true, node: window };
}
```

Rules:

- Start from the rendered container, not from `document.body`.
- Keep the helper local and small.
- Do not hardcode builder-specific class names unless the platform exposes a stable contract.

---

## Measure progress against the active viewport

After resolving the scroll source, calculate the component's top offset relative to the active viewport.

Example pattern:

```js
function getViewportMetrics(container, scrollSource) {
  const containerRect = container.getBoundingClientRect();

  if (scrollSource.isWindow) {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

    return {
      containerRect,
      relativeTop: containerRect.top,
      viewportHeight,
    };
  }

  const viewportRect = scrollSource.node.getBoundingClientRect();

  return {
    containerRect,
    relativeTop: containerRect.top - viewportRect.top,
    viewportHeight: viewportRect.height,
  };
}
```

Rules:

- For `window`, use `window.visualViewport?.height ?? window.innerHeight`.
- For element scroll containers, use the element's bounding rect height as the viewport height.
- Compute progress from `relativeTop`, not directly from `containerRect.top`, when the scroll source is an element.

---

## Bind listeners in one local effect

Keep the scroll listener setup and cleanup in the same `useEffect` that updates the scroll-driven UI.

Example pattern:

```js
useEffect(
  () => {
    const scrollSource = getScrollSource(containerRef.current);
    let frameId = null;

    const update = () => {
      if (!containerRef.current) return;

      const { containerRect, relativeTop, viewportHeight } = getViewportMetrics(
        containerRef.current,
        scrollSource,
      );

      const scrollDistance = containerRect.height - viewportHeight;
      let progress = 0;

      if (scrollDistance > 0) {
        progress = -relativeTop / scrollDistance;
        progress = Math.max(0, Math.min(1, progress));
      } else {
        progress = 1;
      }

      // apply DOM updates or derived visual state here
    };

    const handleScroll = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = null;
        update();
      });
    };

    if (scrollSource.isWindow) {
      window.addEventListener("scroll", handleScroll, true);
    } else {
      scrollSource.node.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      window.addEventListener("scroll", handleScroll, true);
    }

    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      if (scrollSource.isWindow) {
        window.removeEventListener("scroll", handleScroll, true);
      } else {
        scrollSource.node.removeEventListener("scroll", handleScroll);
        window.removeEventListener("scroll", handleScroll, true);
      }

      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  },
  [
    /* only the state that changes the visual output */
  ],
);
```

Rules:

- Use one `requestAnimationFrame` queue per effect.
- Keep cleanup symmetrical with registration.
- `window` capture-phase scroll is still useful as a fallback when nested environments bubble differently.

---

## Separate true scroll behavior from editor preview behavior

For ambient or scroll-driven components, the editor can expose a **Preview Animation** button. That button is a preview aid only.

Recommended pattern:

- real user scroll drives the effect in `live.js`
- preview button replays a temporary visual sequence for editing convenience
- preview state should not replace the real scroll source or force the component into a fake scrolled position permanently

If a component already follows the `settings-animation` skill for ambient or scroll-driven animations, combine that skill with this one.

---

## Use this skill with

- `settings-animation` for scroll-driven reveals that also need an editor preview button
- `breakpoint-height` when the component changes height behavior across breakpoints and also depends on scroll
- `width-breakpoint-layout` when layout shifts by width but the reveal/progress still depends on scrolling

---

## What not to do

```js
// Do NOT assume window is the scroll source in every environment
window.addEventListener("scroll", handleScroll);
const progress =
  -containerRef.current.getBoundingClientRect().top / window.innerHeight;

// Do NOT compute viewport height from window when an element is actually scrolling
const viewportHeight = window.innerHeight; // wrong for nested builder canvases

// Do NOT use an editor preview button as the only behavior users ever see
// It is a fallback for editing, not the runtime implementation.

// Do NOT leave requestAnimationFrame work uncleared on unmount
```

---

## Verification checklist

1. Scroll the component in the AI builder and confirm the visual state changes progressively.
2. Scroll the same component in Preview Mode and confirm the behavior still matches.
3. If the component has a Preview Animation button, verify it still replays without breaking the real scroll logic.
4. Confirm start/end triggers do not fire repeatedly while the component remains partially scrolled.
5. Re-check any sticky layout math after switching from `window` measurements to element-relative measurements.
