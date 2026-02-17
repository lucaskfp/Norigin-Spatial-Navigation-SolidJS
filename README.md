# Norigin Spatial Navigation (SolidJS)

Norigin Spatial Navigation is an open-source library that enables navigating between focusable elements in [SolidJS](https://www.solidjs.com/) applications. It is intended for apps that require directional (key) navigation on web browsers and browser-based Smart TVs and Connected TVs.

Navigation can be controlled by keyboard (browsers) or remote controls (Smart TV / Connected TV). Initialize the service, use `createFocusable` on components that should be focusable, provide focus context where needed, and set the initial focus. The library will determine the next focusable component when using arrow keys.

[![npm version](https://badge.fury.io/js/%40noriginmedia%2Fnorigin-spatial-navigation.svg)](https://badge.fury.io/js/%40noriginmedia%2Fnorigin-spatial-navigation)

## Installation

```bash
npm install @noriginmedia/norigin-spatial-navigation solid-js
```

## Basic usage

1. **Initialize** spatial navigation (e.g. in your app root):

```ts
import { init } from '@noriginmedia/norigin-spatial-navigation';

init();
```

2. **Provide focus context** for focusable trees. Use `FocusContext.Provider` with the container’s `focusKey` so children resolve their parent correctly:

```tsx
import { FocusContext, createFocusable } from '@noriginmedia/norigin-spatial-navigation';

function FocusableSection() {
  const { ref, focusKey, focused } = createFocusable();

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} classList={{ focused: focused() }}>
        {/* focusable content */}
      </div>
    </FocusContext.Provider>
  );
}
```

3. **Make elements focusable** with `createFocusable` and attach the returned `ref`:

```tsx
function FocusableButton() {
  const { ref, focusSelf, focused } = createFocusable({
    onEnterPress: () => { /* handle select/click */ },
  });

  return (
    <button ref={ref} onClick={focusSelf} classList={{ focused: focused() }}>
      Click me
    </button>
  );
}
```

- `ref`: callback ref — use `ref={result.ref}` on the DOM element.
- `focused` / `hasFocusedChild`: Solid accessors — call `focused()` and `hasFocusedChild()` in your template for reactive state.
- `focusSelf(focusDetails?)`: call to move focus to this element programmatically.
- `focusKey`: stable key for this focusable (for context and `setFocus`).

4. **Set initial focus** when needed:

```ts
import { setFocus, ROOT_FOCUS_KEY } from '@noriginmedia/norigin-spatial-navigation';

setFocus(ROOT_FOCUS_KEY); // or a specific focusKey
```

## Supported platforms

| Platform | Notes |
|----------|--------|
| Web browsers | Chrome, Firefox, etc. |
| Smart TVs | Samsung Tizen, LG WebOS, Hisense |
| Other Connected TV | Browser-based set-top boxes (Chromium, Ekioh, Webkit) |

## API

- **init(options?)** – initialize the service (debug, throttle, RTL, etc.).
- **destroy()** – tear down the service.
- **setFocus(focusKey, focusDetails?)** – set focus to a focus key (e.g. `ROOT_FOCUS_KEY`).
- **navigateByDirection(direction, focusDetails)** – move focus by `'up' | 'down' | 'left' | 'right'`.
- **getCurrentFocusKey()**, **pause()**, **resume()**, **updateAllLayouts()**, **setKeyMap()**, **updateRtl()**, **doesFocusableExist()** – see types and SpatialNavigation export.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

**MIT Licensed**
