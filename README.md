# C7ONE — Design System Documentation

> **C7ONE** (pronounced _"clone"_) — One unified UI system governed by 7 core principles.
> A personal, multi-project design system built on Tailwind CSS v4 + shadcn/ui primitives, centered on Centralized Configurable Customization (CCC).

## 1. The Name

**C7** stands for the seven principles the system is built on:

| Principle          | Meaning                                                |
| ------------------ | ------------------------------------------------------ |
| **C**onfiguration  | All design expressed as data — tokens, themes, params  |
| **C**entralization | One provider controls all visual state                 |
| **C**ustomization  | Every value is adjustable — by developers and by users |
| **C**omposition    | UI built from reusable, layered primitives             |
| **C**onsistency    | Shared tokens ensure visual coherence across all apps  |
| **C**ontrol        | Full runtime read/write access via a unified API       |
| **C**anvas         | A layout system for structural composition (panels)    |

**ONE** means exactly what it says:

- Single source of truth (`:root`, one provider)
- One system → many apps
- One-for-all architecture

## 2. Purpose & Philosophy

C7ONE exists to solve one specific frustration: rebuilding the same card, button, modal, theme toggle, and settings panel for every new app — and still ending up with styling that's inconsistent, hard to expose to users, and painful to tweak globally.

The solution isn't just a component library. The cornerstone of C7ONE is **Centralized Configurable Customization (CCC)**: a system where every visual property — colors, radius, spacing, border width, shadow intensity, transition speed, and any arbitrary param you define — lives in one place, flows into every component automatically via CSS variables, and can be exposed to end-users for live reconfiguration with almost zero effort from the developer.

What you get:

- One provider that owns all visual state — colors, modes, shape, motion, depth, and custom params
- Every component reads from that provider automatically, no per-component config needed
- A `SettingsPanel` that's a live management station — developer controls which params are shown, user controls values
- Per-app typed config for app-specific concerns that don't belong in the shared lib
- Built-in i18n with `en` and `uk` locales out of the box

**What it is not**: a general-purpose UI library for strangers. This is opinionated, personal, and built for my specific apps first.

## 3. The CCC System

This is the core of C7ONE. Everything else is built on top of it.

### Concept

Every visual property is a CSS custom property on `:root`. Components reference these properties via Tailwind utility classes. The `C7OneProvider` is the single source of truth — it injects and manages all variables at runtime.

Because it's just CSS variables, changing any value is instantaneous, zero re-render cost, and applies globally to every component without any component-level wiring.

```
C7OneProvider
  └── injects CSS vars onto :root
        ├── color tokens        (--color-bg-base, --color-accent, --color-shadow, ...)
        ├── shape tokens        (--radius, --border-width)
        ├── motion tokens       (--transition-speed)
        ├── depth tokens        (--shadow-intensity)
        └── ...any custom token you inject
```

### Base Token Set

The minimal set shipped by default. All are CSS custom properties:

| Group  | Token                                | Default         | Purpose                        |
| ------ | ------------------------------------ | --------------- | ------------------------------ |
| Color  | `--color-bg-base` … `--color-border` | see `index.css` | Full 13-token semantic palette |
| Shape  | `--radius`                           | `0.375rem`      | Global border radius scale     |
| Shape  | `--border-width`                     | `1px`           | Global border thickness        |
| Motion | `--transition-speed`                 | `200ms`         | Base transition duration       |
| Depth  | `--shadow-intensity`                 | `0`             | Multiplier for shadow layers   |

This is intentionally minimal. The system is designed so adding a new global token is trivial — add it to the config type, inject it in the provider, reference it in components. No architectural changes required.

### Adding Custom Tokens

Any key-value pair can be injected as a global token via the provider:

```tsx
<C7OneProvider
  config={{
    tokens: {
      '--graph-node-color': '#6366f1',
      '--sidebar-width': '240px',
    }
  }}
>
```

Those tokens are now available as CSS variables everywhere, and any component or your own code can reference them immediately.

### Design Modes

Design modes are **presets** — they set a bundle of base tokens at once, plus optionally apply a CSS class (e.g. `design-glass`) that enables special effects like `backdrop-filter`. They are not a separate axis from CCC; they're just a convenient shorthand for a specific combination of token values.

| Mode      | What it presets                                                                  |
| --------- | -------------------------------------------------------------------------------- |
| `classic` | Flat shapes, thin borders, no shadow                                             |
| `neo`     | Elevated `--shadow-intensity`, soft `--radius`, deeper borders                   |
| `glass`   | Adds `.design-glass` class → `backdrop-filter: blur`, semi-transparent bg tokens |
| `minimal` | Max `--radius`, zero borders, zero shadow                                        |

A mode is applied first, then any explicit token overrides in your config win on top of it. You can skip modes entirely and just set tokens directly.

## 4. Architecture Overview

```
C7ONE
├── CCC Layer (core)
│   ├── C7OneProvider         ← single root provider
│   ├── Token registry        ← base tokens + injected custom tokens
│   ├── Design modes          ← presets over base tokens
│   └── useC7One()            ← getters + setters for all tokens
│
├── Component Layer
│   ├── Structural            ← Card, Modal, Header, Footer, Section, Scrollable
│   ├── Textual               ← H1–H6, Body, Code, Badge, Label, Kbd
│   ├── Form                  ← Button, Input, Select, Checkbox, Toggle, Slider, Textarea
│   ├── Data                  ← Table, List, Gallery, DataGrid
│   ├── Navigation            ← Navbar, Sidebar, Tabs, Breadcrumb
│   ├── Feedback              ← Toast, Alert, Spinner, Progress, Skeleton
│   ├── Visual                ← Divider, Avatar, A, custom scrollbar (CSS)
│   └── Controls              ← RandomizeButton, ThemeToggleButton
│
├── Layout Layer (Canvas)
│   ├── Static panels         ← PanelRoot, PanelSplit, PanelLeaf
│   ├── Dynamic panels        ← DynamicPanelRoot, WindowSelector, useWindowContext
│   └── App shell             ← AppShell, PRIMARY_WINDOW_ID, usePrimaryBounds
│
├── Settings Layer
│   ├── SettingsPanel         ← live config management station
│   └── SettingsModalButton   ← convenience trigger that opens SettingsPanel in a modal
│
├── i18n Layer
│   ├── I18nProvider          ← locale state + t() function
│   └── useI18n()             ← locale, setLocale, t()
│
├── Utils
│   ├── cn()                  ← clsx + tailwind-merge helper
│   ├── detectIsDark()        ← perceived-luminance dark/light detection
│   └── buildRandomConfig()   ← random full-theme generator with freedom control
│
└── AppConfig Layer
    └── AppConfigProvider     ← per-app typed config (generic, not in shared lib)
```

## 5. C7OneProvider

The single provider that wraps every app. Manages all visual state and injects CSS variables onto `:root`.

```tsx
<C7OneProvider
  defaultMode="classic"
  storageKey="my-app-settings" // persist across sessions via localStorage
  config={{
    colors: darkTheme,
    shape: {
      radius: "0.5rem",
      borderWidth: "1px",
    },
    motion: {
      transitionSpeed: "200ms",
    },
    depth: {
      shadowIntensity: 1,
    },
    tokens: {
      "--custom-sidebar-width": "260px",
    },
    splitMargin: 8,            // gap between floating panels (0 = seamless)
  }}
>
  <App />
</C7OneProvider>
```

### Props

| Prop          | Type          | Default     | Description                                                 |
| ------------- | ------------- | ----------- | ----------------------------------------------------------- |
| `defaultMode` | `DesignMode`  | `"classic"` | Initial design mode                                         |
| `config`      | `C7OneConfig` | `{}`        | Token values: `colors`, `shape`, `motion`, `depth`, `tokens`, `splitMargin` |
| `storageKey`  | `string`      | —           | localStorage key for persisting settings across sessions    |

### `useC7One()`

The hook that gives full read/write access to all config state:

```tsx
const {
  mode,
  setMode,
  colors,
  setColors,
  shape,
  setShape,
  motion,
  setMotion,
  depth,
  setDepth,
  tokens,
  setToken, // set any single CSS var by name
  injectTokens, // inject a whole map of custom tokens
  getAllTokens, // flat Record<string, string> of every active token
  setTokenValue, // set any token by CSS var name — routes to correct typed setter
} = useC7One();
```

Every setter updates the CSS variable on `:root` immediately — no re-render cascade, no diffing.

## 6. Color System

Colors are one part of the CCC config — not a separate system. A theme is just a `ThemeTokens` object you pass into `config.colors`.

### Token Roles (13 semantic tokens)

| Group      | Tokens                                                        | Purpose                                             |
| ---------- | ------------------------------------------------------------- | --------------------------------------------------- |
| Background | `--color-bg-base` `--color-bg-elevated` `--color-bg-overlay`  | Page, card, modal surfaces                          |
| Foreground | `--color-fg-primary` `--color-fg-muted` `--color-fg-disabled` | Text hierarchy                                      |
| Accent     | `--color-accent` `--color-accent-hover`                       | CTAs, links, highlights                             |
| Semantic   | `--color-success` `--color-warning` `--color-error`           | Status                                              |
| Border     | `--color-border`                                              | Dividers, inputs, edges                             |
| Shadow     | `--color-shadow`                                              | Shadow color (white on dark themes, black on light) |

### Built-in Themes

| ID         | Description                 |
| ---------- | --------------------------- |
| `dark`     | Default dark, neutral grays |
| `light`    | Clean white/off-white       |
| `midnight` | Deep navy + electric blue   |
| `forest`   | Dark greens, earthy tones   |
| `rose`     | Warm dark with rose accent  |
| `slate`    | Muted slate + indigo accent |

## 7. Tailwind v4 Integration

C7ONE ships an `index.css` that consuming apps import once. It registers variants and base tokens using Tailwind v4 syntax — no `tailwind.config.js`, no preset wiring.

```css
/* c7one/styles/index.css */

@source "../dist";

@variant dark    (&:where(.dark, .dark *));
@variant neo     (&:where(.design-neo, .design-neo *));
@variant glass   (&:where(.design-glass, .design-glass *));
@variant minimal (&:where(.design-minimal, .design-minimal *));

@theme {
  --color-bg-base: #0f0f0f;
  --color-bg-elevated: #1a1a1a;
  /* ... full token set ... */
  --color-shadow: #ffffff;
  --radius: 0.375rem;
  --border-width: 1px;
  --transition-speed: 200ms;
  --shadow-intensity: 0;
}
```

In the consuming app:

```css
/* app/src/index.css */
@import "@levkobe/c7one/styles";
@import "tailwindcss";
```

That's the entire setup. Components then use tokens like:

```tsx
className =
  "bg-bg-elevated text-fg-primary border-border rounded-radius border-[length:--border-width]";
```

And design mode variants:

```tsx
className = "bg-bg-elevated glass:bg-white/10 glass:backdrop-blur-md";
```

The CSS also ships themed shadow utilities — `shadow-c7-sm`, `shadow-c7-xl`, `shadow-c7-card` — that adapt to `--color-shadow` so shadows are correct on both light and dark themes.

## 8. Component Layer

All components are Tailwind-styled wrappers around Radix UI primitives (via shadcn/ui). They use `cn()` (clsx + tailwind-merge) for class merging and accept a `className` prop for per-use overrides.

**Override API**: per-component style overrides are done entirely via `className`. No named style props, no style dicts — just Tailwind classes. Minimal API surface, full Tailwind power, zero boilerplate inside components.

```tsx
// Override globally configured radius for one instance
<Card className="rounded-none">...</Card>

// Override color for one button
<Button className="bg-rose-500 hover:bg-rose-400">Delete</Button>
```

### Structural

| Component    | Based On     | Notes                                                         |
| ------------ | ------------ | ------------------------------------------------------------- |
| `Card`       | `div`        | variants: flat, elevated, outlined, glass                     |
| `Modal`      | Radix Dialog | backdrop, close button, `Modal.Trigger` / `Modal.Content` API |
| `Header`     | `div`        | `logo` (left) + `children` (center) + `actions` (right, scrollable on overflow); `sticky` option |
| `Footer`     | `div`        | `scrollable` → `h-14` horizontal icon tab bar (used by AppShell on mobile); default → padded footer |
| `Section`    | `div`        | max-width container + standard padding                        |
| `Scrollable` | `div`        | `axis` (x/y/both) + `overflow` (auto/always/hidden) props     |

### Textual

`H1`–`H6`, `Body` (sm/md/lg), `Code` (inline + block), `Badge` (success/warning/error/neutral), `Label`, `Kbd`

### Form

`Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Toggle`, `Slider` — all Radix-backed

### Data

`Table` (sortable, `Pagination` component), `List` + `ListItem`, `Gallery` + `GalleryCard` (responsive grid), `DataGrid` (column definitions, row data)

### Feedback

`Toast`, `ToastProvider`, `ToastViewport`, `ToastClose`, `Alert`, `Spinner`, `Progress`, `Skeleton`

### Visual

`Divider` (H/V, optional label), `Avatar` (image + fallback initials), `A` (accent-matched link), custom scrollbar (global, via base layer CSS)

### Navigation

`Navbar`, `Sidebar` (with `SidebarGroup` / `NavItem`), `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent`, `Breadcrumb`

## 9. SettingsPanel

The `SettingsPanel` is the live configuration management station. It reads all current token values from `useC7One()` and renders controls for them. The developer controls which settings are exposed to the user via the `expose` prop.

Controls are auto-inferred from the token name and value: color tokens get a color picker, numeric tokens (rem, px, ms, bare numbers) get a slider, and everything else gets a text input.

The panel also provides **Save / Load** buttons that export/import the full config as a JSON file.

```tsx
<SettingsPanel
  expose={[
    "mode",
    "colors",
    "--radius",
    "--border-width",
    "--transition-speed",
  ]}
  presets={[
    {
      label: "Dark neo",
      icon: <MoonIcon />,
      apply: (ctx) => {
        ctx.setMode("neo");
        ctx.setColors(dark);
      },
    },
  ]}
  renderAppSettings={() => <MyAppSpecificSettings />}
/>
```

### Props

| Prop                | Type               | Description                                                                            |
| ------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| `expose`            | `SettingKey[]`     | Which controls to show. Default: `["mode", "colors"]`                                  |
| `presets`           | `SettingsPreset[]` | One-click preset buttons. Each has `label`, optional `icon`, and `apply(ctx)` callback |
| `renderAppSettings` | `() => ReactNode`  | Slot for app-specific controls rendered below the generic ones                         |
| `className`         | `string`           | Extra classes on the root element                                                      |

### `SettingKey` type

```ts
type SettingKey = "mode" | "colors" | `--${string}`;
```

- `"mode"` — renders the four design mode buttons
- `"colors"` — renders theme swatches + individual color pickers for all 13 color tokens
- `"--radius"`, `"--border-width"`, `"--transition-speed"`, `"--shadow-intensity"` — built-in shape/motion/depth sliders
- Any custom token you've injected, e.g. `"--graph-node-color"` — renders the appropriate inferred control

```tsx
// Expose custom tokens alongside the built-ins
expose={["colors", "--graph-node-color"]}
```

### `SettingsModalButton`

A convenience component — renders a small settings icon button that opens the `SettingsPanel` in a modal. Accepts all `SettingsPanelProps` plus an optional `label` (accessible button label) and `buttonClassName`.

```tsx
<SettingsModalButton expose={["mode", "colors"]} label="Open settings" />
```

The panel and button are themselves C7ONE components, fully styled by the token system, droppable into a `PanelLeaf` or rendered anywhere.

## 10. Controls

Opinionated, ready-to-use buttons that wire directly into `useC7One()`. Drop them into any app header, toolbar, or settings panel — no manual context plumbing needed.

### `RandomizeButton`

Generates and applies a fully random theme configuration on click. Uses `buildRandomConfig` + `detectIsDark` internally and calls all the C7ONE setters automatically.

```tsx
// Icon-only (default)
<RandomizeButton freedom={50} />

// With custom label
<RandomizeButton freedom={20} label="Tame" variant="secondary" size="sm" />

// React to the generated config (e.g. to sync local state)
<RandomizeButton
  freedom={100}
  variant="destructive"
  onApply={(cfg) => setMyMode(cfg.mode)}
/>
```

#### Props

| Prop       | Type                             | Default | Description                                              |
| ---------- | -------------------------------- | ------- | -------------------------------------------------------- |
| `freedom`  | `number` (0–100)                 | `20`    | How chaotic the output is. 0 = coherent, 100 = full chaos |
| `onApply`  | `(cfg: RandomizedConfig) => void` | —       | Called after the config is applied                       |
| `label`    | `ReactNode`                      | —       | Optional text after the icon. Omit for icon-only         |
| ...        | `ButtonProps`                    | —       | All `Button` props (`variant`, `size`, `disabled`, etc.) |

### `ThemeToggleButton`

Toggles between two provided `ThemeTokens` configs. Detects the current state via perceived luminance and shows a Sun or Moon icon accordingly.

```tsx
import { dark, light } from "@levkobe/c7one";

// Icon-only toggle
<ThemeToggleButton dark={dark} light={light} variant="ghost" size="sm" />

// Custom icons
<ThemeToggleButton
  dark={dark}
  light={light}
  darkIcon={<SunIcon />}   // shown when current theme is dark (→ click goes light)
  lightIcon={<MoonIcon />} // shown when current theme is light (→ click goes dark)
/>
```

#### Props

| Prop        | Type          | Default       | Description                                             |
| ----------- | ------------- | ------------- | ------------------------------------------------------- |
| `dark`      | `ThemeTokens` | **required**  | Colors applied when switching to dark                   |
| `light`     | `ThemeTokens` | **required**  | Colors applied when switching to light                  |
| `darkIcon`  | `ReactNode`   | `<Sun />`     | Icon shown when the current theme is dark               |
| `lightIcon` | `ReactNode`   | `<Moon />`    | Icon shown when the current theme is light              |
| ...         | `ButtonProps` | —             | All `Button` props (`variant`, `size`, `disabled`, etc.) |

### Color utils

The underlying utilities are also exported for use outside of the pre-built buttons:

```ts
import { detectIsDark, buildRandomConfig } from "@levkobe/c7one";
import type { RandomizedConfig } from "@levkobe/c7one";

// Check if a hex color reads as dark
const isDark = detectIsDark(colors["--color-bg-base"]); // true / false

// Build a random config
const cfg: RandomizedConfig = buildRandomConfig(isDark, 60);
// cfg.colors, cfg.mode, cfg.radius, cfg.borderWidth, cfg.transitionSpeed, cfg.shadowIntensity
```

`buildRandomConfig(isDark, freedom)`:
- **`isDark`** — whether to generate a dark-mode or light-mode palette (lightness ranges are always role-appropriate)
- **`freedom`** — 0–100 integer. At `0`: coherent palette with shared hue groups and constrained saturation. At `100`: every token gets an independent random hue and saturation.

## 11. Canvas — Static Panel System

The **Canvas** principle made concrete. Inspired by VSCode's editor layout, the static layout is a binary tree of splits and content slots — ideal for fixed app layouts declared at design time.

```
PanelRoot
├── PanelSplit (horizontal, 60/40)
│   ├── PanelSplit (vertical, 50/50)
│   │   ├── PanelLeaf id="editor"
│   │   └── PanelLeaf id="terminal"
│   └── PanelLeaf id="sidebar"
```

```tsx
<PanelRoot>
  <PanelSplit direction="horizontal" defaultRatio={0.6}>
    <PanelSplit direction="vertical" defaultRatio={0.5}>
      <PanelLeaf id="editor">
        <MyEditor />
      </PanelLeaf>
      <PanelLeaf id="terminal">
        <MyTerminal />
      </PanelLeaf>
    </PanelSplit>
    <PanelLeaf id="sidebar">
      <MySidebar />
    </PanelLeaf>
  </PanelSplit>
</PanelRoot>
```

Features: drag-to-resize handles, optional persisted ratios via `storageKey` on `PanelSplit`. Backed by `react-resizable-panels`.

`usePanelVisibility(id)` lets you programmatically show/hide/toggle any leaf:

```tsx
const { visible, show, hide, toggle } = usePanelVisibility("sidebar");
```

## 12. Canvas — Dynamic Panel System

For app shells where users control the layout at runtime (add panels, split them, close them, assign content) — like a dashboard or multi-document editor.

```tsx
<DynamicPanelRoot
  windows={[
    { id: "editor", title: "Editor", icon: <CodeIcon />, component: MyEditor },
    {
      id: "preview",
      title: "Preview",
      icon: <EyeIcon />,
      component: MyPreview,
    },
  ]}
  layout={{ type: "leaf", windowId: "editor", isDefault: true }}
  storageKey="my-app-layout"
/>
```

The layout is an N-ary tree of `GroupNode` (splits) and `LeafNode` (content slots). Each leaf can hold one window or be empty (showing a `WindowSelector` picker).

### Layout declaration

```tsx
// Two panels side by side, 78/22 split
const layout: LayoutNodeDecl = {
  type: "group",
  direction: "horizontal",
  sizes: [78, 22],
  children: [
    { type: "leaf", windowId: "editor", isDefault: true },
    { type: "leaf", windowId: null },
  ],
};
```

### `WindowDef`

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier |
| `title` | `string` | Display name shown in the panel header and window-selector grid |
| `icon` | `ReactNode` | Optional icon shown in the panel header and selector |
| `component` | `ComponentType` | Rendered inside the panel body |
| `headless` | `boolean` | Suppress the 32px panel header strip (edge-to-edge content). Also hides the window from the add-window selector. Used internally by `PRIMARY_WINDOW_ID`. |

### User operations

- **Split** — hover near any edge of a panel → click the `+` button to split horizontally or vertically
- **Close** — click `×` in the panel header; the sibling absorbs the space
- **Minimize / Expand** — collapse a panel to its header strip; expand restores it
- **Assign window** — empty panels show `WindowSelector`, a grid of available windows to pick from

### `useWindowContext()`

Access the panel tree and all operations from within a `DynamicPanelRoot`:

```tsx
const {
  windows,
  tree,
  splitPanel,
  closePanel,
  collapsePanel,
  expandPanel,
  assignWindow,
  moveDivider,
} = useWindowContext();
```

### `DynamicPanelRootProps`

| Prop         | Type             | Description                                                          |
| ------------ | ---------------- | -------------------------------------------------------------------- |
| `windows`    | `WindowDef[]`    | Registry of all available window components                          |
| `layout`     | `LayoutNodeDecl` | Initial panel tree (ignored if `storageKey` restores a saved layout) |
| `storageKey` | `string`         | localStorage key for persisting the layout                           |
| `className`  | `string`         | Extra classes on the root element                                    |

The dynamic system uses plain CSS flex with custom drag handles — no `react-resizable-panels` dependency. Moving a divider only affects the two adjacent panels; all others are unaffected.

## 13. AppShell

`AppShell` is the opinionated top-level layout for canvas-first applications — maps, editors, dashboards — where primary content fills the full screen and panels float on top of it.

It composes a fixed `Header`, your primary canvas (`children`), and a `DynamicPanelRoot` panel layer into a single production-ready shell. On mobile it swaps floating panels for a bottom-sheet + footer tab bar.

```tsx
import { AppShell, PRIMARY_WINDOW_ID } from "@levkobe/c7one";
import type { WindowDef, LayoutNodeDecl } from "@levkobe/c7one";

const WINDOWS: WindowDef[] = [
  { id: "inspector", title: "Inspector", icon: <SliderIcon />, component: InspectorPanel },
  { id: "log",       title: "Log",       icon: <TerminalIcon />, component: LogPanel },
];

// Left 55 %: transparent primary slot — your canvas shows through here.
// Right 45 %: two solid floating panels stacked vertically.
const LAYOUT: LayoutNodeDecl = {
  type: "group",
  direction: "horizontal",
  sizes: [55, 45],
  children: [
    { type: "leaf", windowId: PRIMARY_WINDOW_ID, isDefault: true },
    {
      type: "group",
      direction: "vertical",
      sizes: [50, 50],
      children: [
        { type: "leaf", windowId: "inspector" },
        { type: "leaf", windowId: "log" },
      ],
    },
  ],
};

<C7OneProvider config={{ splitMargin: 8 }}>
  <AppShell
    logo={<MyLogo />}
    showSettings
    showThemeSwitcher
    settingsExpose={["mode", "colors", "--radius"]}
    windows={WINDOWS}
    layout={LAYOUT}
    storageKey="my-app-layout"
  >
    <MyCanvas />  {/* fills 100 % of the work area, always behind panels */}
  </AppShell>
</C7OneProvider>
```

### Layout model

```
AppShell
├── Header (h-14, inalienable — cannot be minimized / closed / split)
└── WorkArea (flex-1, relative)
     ├── Primary (absolute inset-0, z-0)  ← children — your canvas
     └── PanelLayer (absolute z-10, inset: splitMargin px)
          └── DynamicPanelRoot
               ├── PRIMARY_WINDOW_ID leaf  ← transparent slot, reserves space
               │                             so panels don't cover the full screen
               └── other panel leaves      ← floating windows with solid chrome
```

### `PRIMARY_WINDOW_ID`

A reserved constant (`"__primary__"`) used as `windowId` in the layout tree to designate the transparent primary slot. The slot is headless (no header strip), invisible (no background), and is automatically:

- **Filtered from the add-window selector** — users cannot assign it to an empty panel
- **Filtered from the mobile footer** — the canvas is always visible, it never needs a tab

```tsx
import { PRIMARY_WINDOW_ID } from "@levkobe/c7one";

const layout: LayoutNodeDecl = {
  type: "leaf",
  windowId: PRIMARY_WINDOW_ID,  // transparent; canvas shows through
  isDefault: true,
};
```

### `splitMargin` and floating chrome

`splitMargin` is configured on `C7OneProvider`, not `AppShell` directly, because it also affects standalone `DynamicPanelRoot` usage.

| Value | Effect |
| --- | --- |
| `0` (default) | Seamless — panels fill edge-to-edge, no gaps (classic split look) |
| `> 0` | Floating card aesthetic — gaps between panels reveal the canvas behind; panels get a border, shadow, and border-radius from your CCC tokens |

The resize-handle thickness scales with `splitMargin` (minimum 4 px).

### `usePrimaryBounds()`

Returns the position and size of the `PRIMARY_WINDOW_ID` slot, expressed in the same coordinate space your canvas renders in (relative to the AppShell work area's top-left corner).

```tsx
import { usePrimaryBounds } from "@levkobe/c7one";

function MyCanvas() {
  const { x, y, width, height, ready } = usePrimaryBounds();

  // Center content precisely at the visible primary slot.
  const cx = ready ? x + width / 2 : myCanvasWidth / 2;
  const cy = ready ? y + height / 2 : myCanvasHeight / 2;
}
```

`ready` is `false` until the first `ResizeObserver` measurement fires. Fall back to your own canvas dimensions until then.

**Why not `window.innerWidth / 2`?** The primary slot is only a portion of the work area — the rest is occupied by floating panels. `usePrimaryBounds()` tells you exactly where the visible area is so you can center, clamp, and snap content to it rather than the full screen.

### `AppShellProps`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `logo` | `ReactNode` | — | Left slot of the header: logo, wordmark, or icon |
| `headerActions` | `ReactNode` | — | Extra content in the header, rendered before built-in buttons |
| `showSettings` | `boolean` | `false` | Render the built-in settings modal button |
| `showThemeSwitcher` | `boolean` | `false` | Render the built-in dark/light theme toggle |
| `settingsExpose` | `SettingKey[]` | — | Keys to expose in the settings panel |
| `settingsPresets` | `SettingsPreset[]` | — | Preset list for the settings panel |
| `settingsRenderAppSettings` | `() => ReactNode` | — | Slot for app-specific controls in the settings panel |
| `darkTheme` | `ThemeTokens` | `dark` | Colors applied when switching to dark |
| `lightTheme` | `ThemeTokens` | `light` | Colors applied when switching to light |
| `children` | `ReactNode` | **required** | Primary content — fills 100 % of the work area, always behind panels |
| `windows` | `WindowDef[]` | — | Window registry; drives floating panels (desktop) and tab bar (mobile) |
| `layout` | `LayoutNodeDecl` | — | Initial panel layout (ignored when `storageKey` restores a saved layout) |
| `storageKey` | `string` | — | `localStorage` key for layout persistence |
| `className` | `string` | — | Extra classes on the root element |

### Mobile behavior (≤ 767 px)

The floating panel layer is replaced by a bottom-sheet model:

- The footer becomes a horizontally-scrollable icon tab bar — one button per window
- Tapping a tab opens a **bottom sheet** (50 % viewport height) that slides up over the canvas
- The primary canvas remains fully visible behind the sheet
- Tapping the active tab again or the `×` button closes the sheet

`PRIMARY_WINDOW_ID` is never shown in the mobile tab bar.

## 14. i18n

C7ONE ships a lightweight i18n layer used internally by `SettingsPanel` and `DataGrid`. You can extend it with your own app strings using the same `t()` hook.

### Setup

```tsx
<I18nProvider defaultLocale="uk" storageKey="my-app-locale">
  <App />
</I18nProvider>
```

`I18nProvider` is optional — `useI18n()` falls back to English when no provider is mounted.

### `useI18n()`

```tsx
const { locale, setLocale, t } = useI18n();

t("settings.title"); // "Settings" / "Налаштування"
t("data.rows", { count: 42 }); // "42 rows" / "42 рядків"
t("nav.home"); // your own key
```

### App-specific messages

Pass your own per-locale string maps via `messages`:

```tsx
<I18nProvider
  defaultLocale="en"
  messages={{
    en: { "nav.home": "Home", "nav.about": "About" },
    uk: { "nav.home": "Головна", "nav.about": "Про нас" },
  }}
>
```

### Built-in locales

| ID   | Language  |
| ---- | --------- |
| `en` | English   |
| `uk` | Ukrainian |

### `I18nProviderProps`

| Prop            | Type                                              | Default | Description                                        |
| --------------- | ------------------------------------------------- | ------- | -------------------------------------------------- |
| `defaultLocale` | `Locale`                                          | `"en"`  | Initial locale                                     |
| `messages`      | `Partial<Record<Locale, Record<string, string>>>` | `{}`    | App-specific strings merged on top of lib messages |
| `storageKey`    | `string`                                          | —       | localStorage key for persisting the locale         |

## 15. AppConfig Layer

Per-app config for things that have nothing to do with the shared library — like node colors in DigraVinci or category settings in SkillTracker. Fully typed via generics, completely isolated from C7ONE's own config.

```tsx
type DigraVinciConfig = {
  nodeColors: Record<string, string>;
  edgeStyle: "curved" | "straight" | "elbow";
  defaultZoom: number;
};

<AppConfigProvider<DigraVinciConfig> config={myConfig}>
  <App />
</AppConfigProvider>;

const config = useAppConfig<DigraVinciConfig>();
```

App-specific logic never bleeds into the shared library.

## 16. File Structure

```
c7one/
├── src/
│   ├── ccc/
│   │   ├── types.ts               ← ThemeTokens, ShapeConfig, MotionConfig, DepthConfig, DesignMode
│   │   ├── themes/                ← dark.ts, light.ts, midnight.ts, forest.ts, rose.ts, slate.ts
│   │   ├── modes/                 ← classic.ts, neo.ts, glass.ts, minimal.ts
│   │   └── inject.ts              ← injects CSS vars onto :root
│   │
│   ├── context/
│   │   ├── C7OneContext.tsx        ← unified provider + useC7One()
│   │   ├── PanelContext.tsx        ← PanelVisibilityProvider + usePanelVisibility()
│   │   └── AppConfigContext.tsx    ← AppConfigProvider + useAppConfig()
│   │
│   ├── components/
│   │   ├── structural/            ← Card, Modal, Header, Footer, Section, Scrollable
│   │   ├── textual/               ← H1–H6, Body, Code, Badge, Label, Kbd
│   │   ├── form/                  ← Button, Input, Textarea, Select, Checkbox, Toggle, Slider
│   │   ├── data/                  ← Table, List, Gallery, DataGrid
│   │   ├── feedback/              ← Toast, Alert, Spinner, Progress, Skeleton
│   │   ├── visual/                ← Divider, Avatar, A
│   │   ├── navigation/            ← Navbar, Sidebar, Tabs, Breadcrumb
│   │   └── controls/              ← RandomizeButton, ThemeToggleButton
│   │
│   ├── panels/
│   │   ├── Panels.tsx               ← PanelRoot, PanelSplit, PanelLeaf (static)
│   │   ├── DynamicPanels.tsx        ← DynamicPanelRoot (dynamic, user-operated)
│   │   ├── WindowContext.tsx        ← WindowProvider, useWindowContext, tree helpers
│   │   ├── WindowSelector.tsx       ← picker UI shown in empty dynamic panel slots
│   │   ├── AppShell.tsx             ← AppShell (header + floating panels + mobile layout)
│   │   └── PrimaryBoundsContext.tsx ← usePrimaryBounds() coordinate pipeline
│   │
│   ├── settings/
│   │   └── SettingsPanel.tsx      ← SettingsPanel, SettingsModalButton
│   │
│   ├── i18n/
│   │   ├── I18nContext.tsx        ← I18nProvider, useI18n()
│   │   ├── types.ts               ← Locale, LibMessages
│   │   └── locales/
│   │       ├── en.ts
│   │       └── uk.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                  ← cn() (clsx + tailwind-merge)
│   │   └── colors.ts              ← detectIsDark(), buildRandomConfig(), RandomizedConfig
│   │
│   └── index.ts                   ← public exports
│
├── styles/
│   └── index.css                  ← @theme tokens, @variant declarations, base layer, shadow utilities
│
├── index.ts
├── tsup.config.ts
├── tsconfig.json
└── package.json
```

## 17. c7one-sandbox

A companion app — the interactive showcase and component explorer for C7ONE.

**Why a separate project, not a built-in route**: keeping it separate means C7ONE the library has zero demo code in its bundle, while the sandbox can update independently and always reflect the latest published package. It's also the best discoverability story — a public URL anyone can visit without installing anything.

**What it includes**:

- Live `SettingsPanel` with all CCC params exposed — every token, every mode
- Component gallery — every component rendered with the current theme/mode applied
- Three `RandomizeButton`s at fixed freedom levels — **Tame** (20%), **Balanced** (50%), **Chaos** (100%) — demonstrating the full range from coherent to maximally random; keyboard shortcut `R` triggers the balanced one
- `ThemeToggleButton` — one-click dark/light switch
- "Reset" button — returns to defaults
- Locale switcher — `en` / `uk`

The sandbox is itself built with C7ONE, so it also serves as a real-world reference implementation.
