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

- One provider that owns all visual state — colors, modes, shape, motion, and custom params
- Every component reads from that provider automatically, no per-component config needed
- A `SettingsPanel` that's a live management station — developer controls which params are shown, user controls values
- Per-app typed config for app-specific concerns that don't belong in the shared lib
- A companion sandbox (c7one-sandbox) for interactive exploration

**What it is not**: a general-purpose UI library for strangers. This is opinionated, personal, and built for my specific apps first.

## 3. The CCC System

This is the core of C7ONE. Everything else is built on top of it.

### Concept

Every visual property is a CSS custom property on `:root`. Components reference these properties via Tailwind utility classes. The `C7OneProvider` is the single source of truth — it injects and manages all variables at runtime.

Because it's just CSS variables, changing any value is instantaneous, zero re-render cost, and applies globally to every component without any component-level wiring.

```
C7OneProvider
  └── injects CSS vars onto :root
        ├── color tokens        (--color-bg-base, --color-accent, ...)
        ├── shape tokens        (--radius, --border-width)
        ├── motion tokens       (--transition-speed)
        ├── shadow tokens       (--shadow-intensity)
        └── ...any custom token you inject
```

### Base Token Set (v1)

The minimal set shipped by default. All are CSS custom properties:

| Group  | Token                                | Default         | Purpose                        |
| ------ | ------------------------------------ | --------------- | ------------------------------ |
| Color  | `--color-bg-base` … `--color-border` | see `index.css` | Full 12-token semantic palette |
| Shape  | `--radius`                           | `0.375rem`      | Global border radius scale     |
| Shape  | `--border-width`                     | `1px`           | Global border thickness        |
| Motion | `--transition-speed`                 | `200ms`         | Base transition duration       |
| Depth  | `--shadow-intensity`                 | `1`             | Multiplier for shadow layers   |

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
│   ├── Structural            ← Card, Modal, Header, Footer, Drawer, Section
│   ├── Textual               ← H1–H6, Body, Code, Badge, Label, Kbd
│   ├── Form                  ← Button, Input, Select, Checkbox, Toggle, Slider, Textarea
│   ├── Data                  ← Table, List, Gallery, DataGrid
│   ├── Navigation            ← Navbar, Sidebar, Tabs, Breadcrumb
│   ├── Feedback              ← Toast, Alert, Spinner, Progress, Skeleton
│   └── Visual                ← Divider, Avatar, Scrollbar, Icon, A
│
├── Layout Layer (Canvas)
│   ├── PanelRoot
│   ├── PanelSplit
│   └── PanelLeaf
│
├── Settings Layer
│   └── SettingsPanel         ← live config management station
│
└── AppConfig Layer
    └── AppConfigProvider     ← per-app typed config (generic, not in shared lib)
```

## 5. C7OneProvider

The single provider that wraps every app. Internally it composes sub-contexts (theme, panel visibility, toast, etc.) but exposes one unified surface.

```tsx
<C7OneProvider
  defaultMode="classic"
  config={{
    colors: darkTheme,
    shape: {
      radius: "0.5rem",
      borderWidth: "1px",
    },
    motion: {
      transitionSpeed: "200ms",
    },
    tokens: {
      "--custom-sidebar-width": "260px",
    },
  }}
>
  <App />
</C7OneProvider>
```

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
  setToken, // set any single CSS var by name
  injectTokens, // inject a whole map of custom tokens
} = useC7One();
```

Every setter updates the CSS variable on `:root` immediately — no re-render cascade, no diffing.

## 6. Color System

Colors are one part of the CCC config — not a separate system. A theme is just a `ThemeTokens` object you pass into `config.colors`.

### Token Roles (12 semantic tokens)

| Group      | Tokens                                                        | Purpose                    |
| ---------- | ------------------------------------------------------------- | -------------------------- |
| Background | `--color-bg-base` `--color-bg-elevated` `--color-bg-overlay`  | Page, card, modal surfaces |
| Foreground | `--color-fg-primary` `--color-fg-muted` `--color-fg-disabled` | Text hierarchy             |
| Accent     | `--color-accent` `--color-accent-hover`                       | CTAs, links, highlights    |
| Semantic   | `--color-success` `--color-warning` `--color-error`           | Status                     |
| Border     | `--color-border`                                              | Dividers, inputs, edges    |

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
  --radius: 0.375rem;
  --border-width: 1px;
  --transition-speed: 200ms;
  --shadow-intensity: 1;
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

| Component | Based On     | Notes                                     |
| --------- | ------------ | ----------------------------------------- |
| `Card`    | `div`        | variants: flat, elevated, outlined, glass |
| `Modal`   | Radix Dialog | backdrop, close button, header slot       |
| `Drawer`  | Radix Dialog | slides from edge                          |
| `Header`  | `div`        | sticky option, logo + nav slots           |
| `Footer`  | `div`        | link columns slot                         |
| `Section` | `div`        | max-width container + standard padding    |

### Textual

`H1`–`H6`, `Body` (sm/md/lg), `Code` (inline + block), `Badge` (success/warning/error/neutral), `Label`, `Kbd`

### Form

`Button`, `Input`, `Select`, `Checkbox`, `Toggle`, `Slider`, `Textarea` — all Radix-backed

### Data

`Table` (sortable, pagination slot), `List`, `Gallery` (responsive grid), `DataGrid` (virtualized rows option)

### Feedback

`Toast`, `Alert`, `Spinner`, `Progress`, `Skeleton`

### Visual

`Divider` (H/V, optional label), `Avatar` (image + fallback initials), `A` (accent-matched link), custom scrollbar (global, via base layer CSS)

## 9. SettingsPanel

The `SettingsPanel` is the live configuration management station. It reads all current values from `useC7One()` and renders controls for them. The developer controls which settings are exposed to the user via props — everything else is still accessible programmatically but hidden from the UI.

```tsx
<SettingsPanel
  expose={["colors", "mode", "shape.radius", "motion.transitionSpeed"]}
  renderAppSettings={() => <MyAppSpecificSettings />}
/>
```

How it works:

- Reads all current token values from the provider on mount
- Renders appropriate controls for each exposed key (color swatches, sliders, mode toggles, etc.)
- User changes call the relevant setter in `useC7One()` — CSS var updates instantly
- `renderAppSettings` slots in arbitrary app-specific controls below the generic ones

The `expose` array accepts dot-path strings for any registered token, including custom ones injected by your app:

```tsx
expose={['colors', 'tokens.--graph-node-color']}
```

The panel is itself a C7ONE component, fully styled by the token system, droppable into a `PanelLeaf` or rendered anywhere.

## 10. Canvas — Panel / Layout System

The **Canvas** principle made concrete. Inspired by VSCode's editor layout, the layout is a binary tree of splits and content slots.

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

Features: drag-to-resize handles, min/max size per leaf, optional persisted ratios via localStorage, collapses to stacked on mobile. Backed by `react-resizable-panels`.

`usePanelVisibility(id)` lets you programmatically show/hide any leaf.

## 11. AppConfig Layer

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

## 13. File Structure

```
c7one/
├── src/
│   ├── ccc/
│   │   ├── types.ts               ← ThemeTokens, ShapeConfig, MotionConfig, DesignMode
│   │   ├── themes/                ← dark.ts, light.ts, midnight.ts, ...
│   │   ├── modes/                 ← classic.ts, neo.ts, glass.ts, minimal.ts
│   │   └── inject.ts              ← injects CSS vars onto :root
│   │
│   ├── context/
│   │   ├── C7OneContext.tsx        ← unified provider (composes sub-contexts)
│   │   ├── PanelContext.tsx
│   │   └── AppConfigContext.tsx
│   │
│   ├── components/
│   │   ├── structural/
│   │   ├── textual/
│   │   ├── form/
│   │   ├── data/
│   │   ├── feedback/
│   │   ├── visual/
│   │   └── navigation/
│   │
│   ├── panels/
│   │   ├── PanelRoot.tsx
│   │   ├── PanelSplit.tsx
│   │   └── PanelLeaf.tsx
│   │
│   ├── settings/
│   │   └── SettingsPanel.tsx
│   │
│   └── utils/
│       ├── cn.ts
│       └── hooks.ts               ← useC7One, usePanelVisibility, useAppConfig
│
├── styles/
│   └── index.css                  ← @theme tokens, @variant declarations, base layer
│
├── index.ts
├── tsup.config.ts
├── tsconfig.json
└── package.json
```

## 14. c7one-sandbox

A companion app hosted on GitHub Pages — the interactive showcase and component explorer for C7ONE.

**Why a separate project, not a built-in route**: keeping it separate means C7ONE the library has zero demo code in its bundle, while the sandbox can update independently and always reflect the latest published package. It's also the best discoverability story — a public URL anyone can visit without installing anything.

**What it includes**:

- Live `SettingsPanel` with all CCC params exposed — every token, every mode
- Component gallery — every component rendered with the current theme/mode applied
- "Randomize" button — picks a random theme, mode, shuffles shape/motion tokens, rebuilds the gallery so you can see the full range of what's possible
- "Reset" button — returns to defaults
- Per-component `className` override input — lets you test Tailwind override behavior live

The sandbox is itself built with C7ONE, so it also serves as a real-world reference implementation.
