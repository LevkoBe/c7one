// AppShell — opinionated top-level layout with inalienable Header + Primary window.
//
// Desktop layout:
//   Header (fixed h-14)
//   └─ WorkArea (flex-1, relative)  ← workAreaRef
//        ├─ Primary (absolute inset-0, z-0)   ← actual canvas content
//        └─ PanelLayer (absolute inset-{splitMargin}px, z-10)
//             └─ DynamicPanelRoot
//                  ├─ PRIMARY_WINDOW_ID leaf  ← PrimaryPlaceholder, headless,
//                  │                            measures itself via ResizeObserver,
//                  │                            reports viewport DOMRect to AppShell
//                  └─ other panels            ← solid floating windows
//
// AppShell converts PrimaryPlaceholder's viewport rect → work-area-relative coords
// and publishes them via PrimaryBoundsContext.  The canvas reads them with
// usePrimaryBounds() to know exactly where the visible primary slot is.
//
// Mobile layout (≤ 767px):
//   Header (same as desktop)
//   └─ WorkArea (flex-1, relative, overflow-hidden)
//        ├─ Primary (fills full height)
//        └─ BottomSheet (overlay, 50 % height, slides up when a window is active)
//   Footer (h-14, horizontally scrollable window-icon tab bar)

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { useC7One } from "../context/C7OneContext";
import { Header } from "../components/structural/Layout";
import { Footer } from "../components/structural/Layout";
import { SettingsModalButton } from "../settings/SettingsPanel";
import { ThemeToggleButton } from "../components/controls/ThemeToggleButton";
import { dark as darkThemeDefault, light as lightThemeDefault } from "../ccc/themes";
import { cn } from "../utils/cn";
import { DynamicPanelRoot } from "./DynamicPanels";
import { PRIMARY_WINDOW_ID } from "./WindowContext";
import {
  PrimaryBoundsContext,
  PrimaryRectSetterContext,
  type PrimaryBounds,
} from "./PrimaryBoundsContext";
import type { WindowDef, LayoutNodeDecl } from "./WindowContext";
import type { ThemeTokens } from "../ccc/types";
import type { SettingKey, SettingsPreset } from "../settings/SettingsPanel";

// ─── Primary window placeholder ──────────────────────────────────────────────
// Renders a full-size transparent div.  ResizeObserver tracks its viewport rect
// and reports it upward via PrimaryRectSetterContext so AppShell can convert it
// to work-area-relative PrimaryBounds and publish for the canvas to consume.

function PrimaryPlaceholder() {
  const reportRect = useContext(PrimaryRectSetterContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !reportRect) return;
    const measure = () => reportRect(el.getBoundingClientRect());
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure(); // initial measurement
    return () => ro.disconnect();
  }, [reportRect]);

  return <div ref={ref} className="w-full h-full" />;
}

const PRIMARY_WINDOW_DEF: WindowDef = {
  id: PRIMARY_WINDOW_ID,
  title: "Primary",
  headless: true,
  component: PrimaryPlaceholder,
};

// ─── Mobile detection ─────────────────────────────────────────────────────────

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    setMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

// ─── AppShell props ───────────────────────────────────────────────────────────

export interface AppShellProps {
  // ── Header ──────────────────────────────────────────────────────────────────
  /** Left slot of the header: logo, wordmark, or icon. */
  logo?: React.ReactNode;
  /** Custom right-side actions rendered before built-in buttons. */
  headerActions?: React.ReactNode;
  /** Render the built-in settings modal button in the header. Default: false. */
  showSettings?: boolean;
  /** Render the built-in dark/light theme toggle in the header. Default: false. */
  showThemeSwitcher?: boolean;
  /** Settings keys to expose in the built-in settings panel. */
  settingsExpose?: SettingKey[];
  /** Preset list for the built-in settings panel. */
  settingsPresets?: SettingsPreset[];
  /** Extra content rendered inside the settings panel (app-specific settings). */
  settingsRenderAppSettings?: () => React.ReactNode;
  /** Dark ThemeTokens used by the built-in theme toggle. Defaults to c7one dark. */
  darkTheme?: ThemeTokens;
  /** Light ThemeTokens used by the built-in theme toggle. Defaults to c7one light. */
  lightTheme?: ThemeTokens;

  // ── Primary window ────────────────────────────────────────────────────────
  /** Primary content. Always fills 100 % of the work area, always behind panels. */
  children: React.ReactNode;

  // ── Floating panels (desktop) / tabs (mobile) ─────────────────────────────
  /** Window registry. Drives both desktop floating panels and the mobile tab bar. */
  windows?: WindowDef[];
  /** Initial panel layout declaration (desktop only). */
  layout?: LayoutNodeDecl;
  /** localStorage key passed to DynamicPanelRoot for layout persistence. */
  storageKey?: string;

  className?: string;
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({
  logo,
  headerActions,
  showSettings = false,
  showThemeSwitcher = false,
  settingsExpose,
  settingsPresets,
  settingsRenderAppSettings,
  darkTheme = darkThemeDefault,
  lightTheme = lightThemeDefault,
  children,
  windows,
  layout,
  storageKey,
  className,
}: AppShellProps) {
  const { splitMargin } = useC7One();
  const isMobile = useIsMobile();
  const hasWindows = !!windows && windows.length > 0 && !!layout;

  // ── Primary bounds tracking ────────────────────────────────────────────────
  // workAreaRef lets us convert viewport coords → work-area-relative coords.
  const workAreaRef = useRef<HTMLDivElement>(null);
  const [primaryBounds, setPrimaryBounds] = useState<PrimaryBounds>({
    x: 0, y: 0, width: 0, height: 0, ready: false,
  });

  const handlePrimaryRect = useCallback((viewportRect: DOMRect) => {
    const wa = workAreaRef.current;
    if (!wa) return;
    const waRect = wa.getBoundingClientRect();
    setPrimaryBounds({
      x: viewportRect.left - waRect.left,
      y: viewportRect.top - waRect.top,
      width: viewportRect.width,
      height: viewportRect.height,
      ready: true,
    });
  }, []);

  // ── Window lists ──────────────────────────────────────────────────────────
  // Prepend the primary placeholder so DynamicPanelRoot can resolve its leaf.
  // Filter it from the mobile footer — primary is always visible, never a tab.
  const allWindows = useMemo(
    () => (windows ? [PRIMARY_WINDOW_DEF, ...windows] : [PRIMARY_WINDOW_DEF]),
    [windows],
  );
  const mobileTabWindows = useMemo(
    () => (windows ?? []).filter((w) => w.id !== PRIMARY_WINDOW_ID),
    [windows],
  );

  // ── Mobile state ──────────────────────────────────────────────────────────
  const [mobileActiveId, setMobileActiveId] = useState<string | null>(null);
  const mobileActiveWindow = windows?.find((w) => w.id === mobileActiveId) ?? null;
  const toggleMobileWindow = (id: string) =>
    setMobileActiveId((prev) => (prev === id ? null : id));

  // ── Header actions ────────────────────────────────────────────────────────
  const builtInActions = (
    <>
      {headerActions}
      {showThemeSwitcher && (
        <ThemeToggleButton
          dark={darkTheme}
          light={lightTheme}
          variant="ghost"
          size="sm"
        />
      )}
      {showSettings && (
        <SettingsModalButton
          expose={settingsExpose}
          presets={settingsPresets}
          renderAppSettings={settingsRenderAppSettings}
        />
      )}
    </>
  );

  return (
    <PrimaryBoundsContext.Provider value={primaryBounds}>
      <PrimaryRectSetterContext.Provider value={handlePrimaryRect}>
        <div
          className={cn(
            "flex flex-col w-full h-full bg-bg-base text-fg-primary overflow-hidden",
            className,
          )}
        >
          {/* ── Header ───────────────────────────────────────────────────── */}
          <Header logo={logo} actions={builtInActions} />

          {/* ── Work area ────────────────────────────────────────────────── */}
          <div ref={workAreaRef} className="relative flex-1 min-h-0 overflow-hidden">
            {/* Primary content — full size, always behind panels */}
            <div className="absolute inset-0 z-0">{children}</div>

            {/* Desktop: floating panel layer */}
            {!isMobile && hasWindows && (
              <div
                className="absolute z-10 pointer-events-none"
                style={{ inset: `${splitMargin}px` }}
              >
                <div className="pointer-events-none w-full h-full">
                  <DynamicPanelRoot
                    windows={allWindows}
                    layout={layout!}
                    storageKey={storageKey}
                  />
                </div>
              </div>
            )}

            {/* Mobile: bottom sheet */}
            {isMobile && mobileActiveWindow && (
              <MobileBottomSheet
                windowDef={mobileActiveWindow}
                onClose={() => setMobileActiveId(null)}
              />
            )}
          </div>

          {/* ── Mobile footer tab bar ─────────────────────────────────────── */}
          {isMobile && hasWindows && (
            <Footer scrollable>
              {mobileTabWindows.map((w) => (
                <MobileTabButton
                  key={w.id}
                  windowDef={w}
                  active={w.id === mobileActiveId}
                  onClick={() => toggleMobileWindow(w.id)}
                />
              ))}
            </Footer>
          )}
        </div>
      </PrimaryRectSetterContext.Provider>
    </PrimaryBoundsContext.Provider>
  );
}

// ─── MobileBottomSheet ────────────────────────────────────────────────────────

function MobileBottomSheet({
  windowDef,
  onClose,
}: {
  windowDef: WindowDef;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-50",
        "flex flex-col",
        "bg-bg-base border-t border-border shadow-xl",
        "animate-in slide-in-from-bottom-4 duration-(--transition-speed)",
      )}
      style={{ height: "50%", borderRadius: "var(--radius) var(--radius) 0 0" }}
    >
      <div
        className="flex items-center gap-2 px-3 h-9 shrink-0 bg-bg-elevated border-b border-border"
        style={{ borderRadius: "var(--radius) var(--radius) 0 0" }}
      >
        {windowDef.icon && (
          <span className="w-4 h-4 text-fg-muted flex items-center justify-center shrink-0">
            {windowDef.icon}
          </span>
        )}
        <span className="flex-1 text-xs font-medium text-fg-primary truncate">
          {windowDef.title}
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-sm",
            "text-fg-muted hover:text-fg-primary hover:bg-bg-overlay",
            "transition-[color,background-color] duration-(--transition-speed)",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
          )}
        >
          <X width={12} height={12} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <windowDef.component />
      </div>
    </div>
  );
}

// ─── MobileTabButton ──────────────────────────────────────────────────────────

function MobileTabButton({
  windowDef,
  active,
  onClick,
}: {
  windowDef: WindowDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={windowDef.title}
      title={windowDef.title}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 shrink-0 rounded",
        "min-w-12 text-[10px] font-medium",
        "transition-[color,background-color] duration-(--transition-speed)",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
        active
          ? "bg-accent text-bg-base"
          : "text-fg-muted hover:text-fg-primary hover:bg-bg-overlay",
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {windowDef.icon}
      </span>
      <span className="truncate max-w-12">{windowDef.title}</span>
    </button>
  );
}
