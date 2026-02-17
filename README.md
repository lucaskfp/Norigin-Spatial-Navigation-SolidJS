# Norigin Spatial Navigation (SolidJS)

Norigin Spatial Navigation is an open-source library that enables directional navigation between focusable elements in [SolidJS](https://www.solidjs.com/) applications. It targets apps that require arrow-key or remote-control navigation on **web browsers**, **Smart TVs** (Samsung Tizen, LG WebOS, Hisense) and **Connected TVs** (browser-based set-top boxes).

This is a SolidJS port of the original [React library](https://github.com/NoriginMedia/Norigin-Spatial-Navigation), adapted to use SolidJS primitives (`createSignal`, `createEffect`, `createContext`, `onCleanup`).

[![npm version](https://badge.fury.io/js/%40noriginmedia%2Fnorigin-spatial-navigation.svg)](https://badge.fury.io/js/%40noriginmedia%2Fnorigin-spatial-navigation)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [init](#initoptions)
  - [createFocusable](#createfocusableconfig)
  - [FocusContext](#focuscontext)
  - [Top-level Functions](#top-level-functions)
  - [Types](#types)
- [Advanced Usage](#advanced-usage)
  - [Focus Boundaries](#focus-boundaries)
  - [Preferred Child Focus](#preferred-child-focus)
  - [Force Focus](#force-focus)
  - [Track Children](#track-children)
  - [Custom Key Map](#custom-key-map)
  - [RTL Support](#rtl-support)
  - [Custom Distance Calculation](#custom-distance-calculation)
  - [Visual Debugging](#visual-debugging)
  - [Pause and Resume](#pause-and-resume)
- [Supported Platforms](#supported-platforms)
- [Migration from React](#migration-from-react)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

---

## Installation

```bash
npm install @noriginmedia/norigin-spatial-navigation solid-js
```

`solid-js` (^1.0.0) is a peer dependency and must be installed alongside the library.

---

## Quick Start

### 1. Initialize the service

Call `init()` once at your app root before rendering focusable components:

```ts
import { init } from '@noriginmedia/norigin-spatial-navigation';

init({
  // debug: true,        // enable console logs
  // visualDebug: true,  // show a canvas overlay with focusable areas
});
```

### 2. Create a focusable container with focus context

Use `FocusContext.Provider` to build a focus tree. Every parent that contains focusable children should provide its `focusKey` via the context:

```tsx
import { FocusContext, createFocusable } from '@noriginmedia/norigin-spatial-navigation';

function Menu() {
  const { ref, focusKey, focused, hasFocusedChild } = createFocusable();

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} classList={{ focused: focused(), 'has-focused-child': hasFocusedChild() }}>
        <MenuItem label="Home" />
        <MenuItem label="Settings" />
        <MenuItem label="About" />
      </div>
    </FocusContext.Provider>
  );
}
```

### 3. Create leaf focusable elements

Attach the `ref` returned by `createFocusable` to a DOM element. Use the `focused()` accessor for reactive styling:

```tsx
function MenuItem(props: { label: string }) {
  const { ref, focused, focusSelf } = createFocusable({
    onEnterPress: () => console.log(`${props.label} selected`),
  });

  return (
    <div ref={ref} classList={{ focused: focused() }} onClick={() => focusSelf()}>
      {props.label}
    </div>
  );
}
```

### 4. Set the initial focus

```ts
import { setFocus, ROOT_FOCUS_KEY } from '@noriginmedia/norigin-spatial-navigation';

// Focus the root (navigates down to the first available leaf)
setFocus(ROOT_FOCUS_KEY);

// Or focus a specific key
setFocus('MY_MENU');
```

---

## API Reference

### `init(options?)`

Initialize the spatial navigation service. Call once before any focusable component mounts.

| Option | Type | Default | Description |
|---|---|---|---|
| `debug` | `boolean` | `false` | Enable debug logging to the console |
| `visualDebug` | `boolean` | `false` | Show a canvas overlay highlighting focusable areas |
| `nativeMode` | `boolean` | `false` | Read-only mode for React Native, syncing focus state only |
| `throttle` | `number` | `0` | Throttle delay for key presses (ms) |
| `throttleKeypresses` | `boolean` | `false` | Enable key press throttling |
| `useGetBoundingClientRect` | `boolean` | `false` | Use `getBoundingClientRect` instead of `offsetLeft`/`offsetTop` for layout measurement |
| `shouldFocusDOMNode` | `boolean` | `false` | Also call `.focus()` on the underlying DOM element |
| `domNodeFocusOptions` | `FocusOptions` | `{}` | Options passed to the native `.focus()` call when `shouldFocusDOMNode` is enabled |
| `shouldUseNativeEvents` | `boolean` | `false` | Do not call `preventDefault()` on key events |
| `rtl` | `boolean` | `false` | Enable right-to-left layout mode |
| `distanceCalculationMethod` | `'center' \| 'edges' \| 'corners'` | `'corners'` | Method used to calculate distance between focusable elements |
| `customDistanceCalculationFunction` | `DistanceCalculationFunction` | — | Custom function overriding secondary-axis distance calculation |

---

### `createFocusable(config?)`

The main hook. Returns refs, state, and helpers to make a component participate in spatial navigation.

#### Config (`UseFocusableConfig<P>`)

| Option | Type | Default | Description |
|---|---|---|---|
| `focusKey` | `string` | auto-generated | Stable identifier for this focusable node |
| `focusable` | `boolean` | `true` | Whether this component participates in navigation |
| `saveLastFocusedChild` | `boolean` | `true` | Remember which child was last focused when re-entering this parent |
| `trackChildren` | `boolean` | `false` | Track whether any descendant is focused (populates `hasFocusedChild`) |
| `autoRestoreFocus` | `boolean` | `true` | Auto-restore focus to a sibling/parent when this component unmounts |
| `forceFocus` | `boolean` | `false` | Become the target of auto-restore focus when focus is lost |
| `isFocusBoundary` | `boolean` | `false` | Block navigation from leaving this component |
| `focusBoundaryDirections` | `Direction[]` | — | Limit `isFocusBoundary` to specific directions |
| `preferredChildFocusKey` | `string` | — | Focus this specific child when navigating into this parent |
| `onEnterPress` | `(props: P, details: KeyPressDetails) => void` | — | Called when Enter/OK is pressed on this element |
| `onEnterRelease` | `(props: P) => void` | — | Called when Enter/OK is released |
| `onArrowPress` | `(direction: string, props: P, details: KeyPressDetails) => boolean` | — | Called on arrow press. Return `false` to prevent navigation |
| `onArrowRelease` | `(direction: string, props: P) => void` | — | Called on arrow release |
| `onFocus` | `(layout: FocusableComponentLayout, props: P, details: FocusDetails) => void` | — | Called when this element receives focus |
| `onBlur` | `(layout: FocusableComponentLayout, props: P, details: FocusDetails) => void` | — | Called when this element loses focus |
| `extraProps` | `P` | — | Extra props passed back to all callbacks |

#### Return (`UseFocusableResult<E>`)

| Property | Type | Description |
|---|---|---|
| `ref` | `(el: E \| undefined) => void` | Callback ref — assign to `ref={result.ref}` on the DOM element |
| `focused` | `() => boolean` | Solid accessor — reactive focused state. Call `focused()` in JSX |
| `hasFocusedChild` | `() => boolean` | Solid accessor — reactive child focus state. Requires `trackChildren: true` on the parent |
| `focusSelf` | `(focusDetails?: FocusDetails) => void` | Programmatically move focus to this element |
| `focusKey` | `string` | The stable focus key for this node |

> **Note:** `useFocusable` is exported as a deprecated alias for `createFocusable`.

---

### `FocusContext`

A SolidJS `Context<string>` that carries the parent `focusKey` down the tree. Defaults to `ROOT_FOCUS_KEY` (`"SN:ROOT"`).

```tsx
import { FocusContext, createFocusable } from '@noriginmedia/norigin-spatial-navigation';

function ParentComponent() {
  const { ref, focusKey } = createFocusable({ focusKey: 'PARENT' });

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref}>
        <ChildComponent />
      </div>
    </FocusContext.Provider>
  );
}
```

---

### Top-level Functions

These are convenience wrappers around the `SpatialNavigation` singleton:

| Function | Signature | Description |
|---|---|---|
| `init` | `(options?) => void` | Initialize the service |
| `destroy` | `() => void` | Tear down the service and remove event listeners |
| `setFocus` | `(focusKey: string, focusDetails?: FocusDetails) => void` | Set focus to a specific component by key |
| `navigateByDirection` | `(direction: string, focusDetails: FocusDetails) => void` | Programmatically move focus in a direction |
| `getCurrentFocusKey` | `() => string` | Get the currently focused element's key |
| `pause` | `() => void` | Pause all navigation (ignores key events) |
| `resume` | `() => void` | Resume navigation |
| `updateAllLayouts` | `() => void` | Recalculate all focusable layouts (call after dynamic layout changes) |
| `setKeyMap` | `(keyMap: BackwardsCompatibleKeyMap) => void` | Customize key-to-direction mappings |
| `setThrottle` | `(options?) => void` | Update throttle settings at runtime |
| `doesFocusableExist` | `(focusKey: string) => boolean` | Check if a focusable component is registered |
| `updateRtl` | `(rtl: boolean) => void` | Toggle RTL mode at runtime |

The `SpatialNavigation` singleton itself is also exported for direct access.

---

### Types

All types are exported and available for TypeScript consumers:

```ts
import type {
  Direction,              // 'up' | 'down' | 'left' | 'right'
  FocusDetails,           // Extra details passed through focus callbacks
  KeyPressDetails,        // { pressedKeys: PressedKeys }
  PressedKeys,            // { [key: string]: number }
  FocusableComponentLayout, // { left, top, right, bottom, width, height, x, y, node }
  UseFocusableConfig,     // Config for createFocusable
  UseFocusableResult,     // Return type of createFocusable
  EnterPressHandler,
  EnterReleaseHandler,
  ArrowPressHandler,
  ArrowReleaseHandler,
  FocusHandler,
  BlurHandler,
  KeyMap,
  BackwardsCompatibleKeyMap,
} from '@noriginmedia/norigin-spatial-navigation';
```

---

## Advanced Usage

### Focus Boundaries

Prevent navigation from escaping a container:

```tsx
const { ref, focusKey } = createFocusable({
  isFocusBoundary: true,
  // Optionally restrict to specific directions:
  focusBoundaryDirections: ['left', 'right'],
});
```

### Preferred Child Focus

When navigating into a parent, focus a specific child instead of the default:

```tsx
const { ref, focusKey } = createFocusable({
  preferredChildFocusKey: 'SETTINGS_BUTTON',
});
```

### Force Focus

Mark a component as the fallback target when focus is lost (e.g., when the focused element is removed):

```tsx
const { ref } = createFocusable({
  forceFocus: true,
});
```

### Track Children

Enable `hasFocusedChild` tracking on a parent — useful for styling parents when any descendant is focused:

```tsx
const { ref, hasFocusedChild, focusKey } = createFocusable({
  trackChildren: true,
});

// hasFocusedChild() is reactive
<div ref={ref} classList={{ highlight: hasFocusedChild() }}>...</div>
```

### Custom Key Map

Override the default arrow keys and Enter:

```ts
import { setKeyMap } from '@noriginmedia/norigin-spatial-navigation';

setKeyMap({
  left: [37, 'ArrowLeft'],
  up: [38, 'ArrowUp'],
  right: [39, 'ArrowRight'],
  down: [40, 'ArrowDown'],
  enter: [13, 'Enter'],
});
```

### RTL Support

Enable right-to-left layout at init or toggle at runtime:

```ts
import { init, updateRtl } from '@noriginmedia/norigin-spatial-navigation';

init({ rtl: true });

// Toggle later
updateRtl(false);
```

### Custom Distance Calculation

Choose between built-in methods or supply your own:

```ts
init({
  distanceCalculationMethod: 'center', // 'center' | 'edges' | 'corners' (default)
});

// Or provide a custom function:
init({
  customDistanceCalculationFunction: (refCorners, siblingCorners, isVertical, method) => {
    // Return a numeric distance
    return Math.abs(refCorners.a.x - siblingCorners.a.x);
  },
});
```

### Visual Debugging

Enable a canvas overlay that highlights all focusable areas, their keys, and parent relationships:

```ts
init({
  debug: true,
  visualDebug: true,
});
```

### Pause and Resume

Temporarily disable spatial navigation (e.g., when a modal/overlay is handling its own input):

```ts
import { pause, resume } from '@noriginmedia/norigin-spatial-navigation';

pause();   // ignores all key events
resume();  // restores navigation
```

---

## Supported Platforms

| Platform | Notes |
|---|---|
| Web browsers | Chrome, Firefox, Safari, Edge, etc. |
| Smart TVs | Samsung Tizen, LG WebOS, Hisense VIDAA |
| Connected TVs | Browser-based set-top boxes (Chromium, Ekioh, WebKit) |

---

## Migration from React

If you are migrating from the React version of Norigin Spatial Navigation:

| React | SolidJS |
|---|---|
| `useFocusable(config)` | `createFocusable(config)` |
| `focused` (boolean) | `focused()` (accessor — call as a function) |
| `hasFocusedChild` (boolean) | `hasFocusedChild()` (accessor — call as a function) |
| `ref` via `useRef` + `ref={ref}` | Callback ref: `ref={result.ref}` |
| `React.createContext` / `useContext` | `FocusContext` from the package (SolidJS Context) |
| Peer dep: `react` | Peer dep: `solid-js` (^1.0.0) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

### Scripts

```bash
npm run build           # Build the library (tsup, ESM output)
npm test                # Run tests (vitest)
npm run test:coverage   # Run tests with coverage report
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

**MIT Licensed** - see [LICENSE](LICENSE).
