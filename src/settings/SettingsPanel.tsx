import React, { useRef } from "react";
import { Settings } from "lucide-react";
import { useC7One } from "../context/C7OneContext";
import { useI18n } from "../i18n/I18nContext";
import type { C7OneContextValue, DesignMode, ThemeTokens } from "../ccc/types";
import * as themes from "../ccc/themes";
import { cn } from "../utils/cn";
import { Modal } from "../components/structural/Modal";
import { Label } from "../components/textual/Typography";
import { Slider } from "../components/form/FormControls";
import { Button } from "../components/form/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

/** 'mode' and 'colors' are special preset controls; any '--*' is a CSS var name. */
export type SettingKey = "mode" | "colors" | `--${string}`;

export interface SettingsPreset {
  label: string;
  icon?: React.ReactNode;
  apply: (ctx: C7OneContextValue) => void;
}

export interface SettingsPanelProps {
  expose?: SettingKey[];
  presets?: SettingsPreset[];
  renderAppSettings?: () => React.ReactNode;
  className?: string;
}

// ─── Inference ────────────────────────────────────────────────────────────────

type ControlType = "color" | "slider" | "text";

function inferControl(name: string, value: string): ControlType {
  if (name.includes("color")) return "color";
  if (/^-?\d*\.?\d+(rem|px|em|ms|s|%)/.test(value.trim())) return "slider";
  if (/^-?\d*\.?\d+$/.test(value.trim())) return "slider";
  return "text";
}

type SliderDef = {
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
};

function inferSlider(value: string): SliderDef {
  const v = value.trim();
  if (v.endsWith("rem"))
    return { min: 0, max: 3, step: 0.01, format: (n) => `${n.toFixed(2)}rem` };
  if (v.endsWith("px"))
    return { min: 0, max: 20, step: 1, format: (n) => `${Math.round(n)}px` };
  if (v.endsWith("ms"))
    return { min: 0, max: 2000, step: 10, format: (n) => `${Math.round(n)}ms` };
  if (v.endsWith("s"))
    return { min: 0, max: 10, step: 0.1, format: (n) => `${n.toFixed(1)}s` };
  if (v.endsWith("%"))
    return { min: 0, max: 100, step: 1, format: (n) => `${Math.round(n)}%` };
  // bare number
  return { min: 0, max: 20, step: 0.1, format: (n) => `${n.toFixed(1)}` };
}

/** Groups a CSS var by its first name segment: '--color-bg-base' → 'color' */
function inferGroup(name: string): string {
  const m = /^--([a-z]+)/.exec(name);
  return m ? m[1] : "other";
}

// ─── File I/O helpers ─────────────────────────────────────────────────────────

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Theme list — derived from the themes index, never hardcoded ──────────────

const BUILT_IN_THEMES = (Object.entries(themes) as [string, ThemeTokens][]).map(
  ([id, tokens]) => ({ id, tokens }),
);

const MODES: DesignMode[] = ["classic", "neo", "glass", "minimal"];

// ─── Token Control ────────────────────────────────────────────────────────────

function TokenControl({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const control = inferControl(name, value);
  const label = name.replace(/^--/, "");

  if (control === "color") {
    const safeHex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
    return (
      <div className="flex items-center justify-between gap-2">
        <Label
          className="text-[10px] text-fg-muted truncate flex-1"
          title={name}
        >
          {label}
        </Label>
        <input
          type="color"
          value={safeHex}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
          title={name}
        />
      </div>
    );
  }

  if (control === "slider") {
    const { min, max, step, format } = inferSlider(value);
    const num = parseFloat(value) || 0;
    return (
      <div>
        <Label className="text-xs text-fg-muted mb-1.5 block">
          {label} — {value}
        </Label>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[num]}
          onValueChange={([v]) => onChange(format(v))}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-[10px] text-fg-muted truncate flex-1" title={name}>
        {label}
      </Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-24 text-xs bg-bg-elevated border border-border rounded px-1.5 text-fg-primary"
      />
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-fg-disabled mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SettingsPanel({
  expose,
  presets,
  renderAppSettings,
  className,
}: SettingsPanelProps) {
  const ctx = useC7One();
  const { t } = useI18n();
  const allTokens = ctx.getAllTokens();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    downloadJson(
      {
        mode: ctx.mode,
        colors: ctx.colors,
        shape: ctx.shape,
        motion: ctx.motion,
        depth: ctx.depth,
        tokens: ctx.tokens,
      },
      "c7one-settings.json",
    );
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.mode) ctx.setMode(data.mode);
        if (data.colors) ctx.setColors(data.colors);
        if (data.shape) ctx.setShape(data.shape);
        if (data.motion) ctx.setMotion(data.motion);
        if (data.depth) ctx.setDepth(data.depth);
        if (data.tokens) ctx.injectTokens(data.tokens);
      } catch {
        // malformed JSON — ignore
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  // Default: mode + color swatches only. Devs add more via expose.
  const keys: SettingKey[] = expose ?? ["mode", "colors"];

  const showMode = keys.includes("mode");
  const showColors = keys.includes("colors");

  // Collect token keys. When 'colors' is showing, skip --color-* to avoid
  // duplicating what the swatches already cover.
  const tokenKeys = keys.filter(
    (k): k is `--${string}` =>
      k.startsWith("--") && (!showColors || !k.startsWith("--color-")),
  );

  // Group token keys by first CSS var segment for visual sections
  const groupMap: Record<string, `--${string}`[]> = {};
  for (const k of tokenKeys) {
    const g = inferGroup(k);
    (groupMap[g] ??= []).push(k);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold text-fg-primary">{t("settings.title")}</p>
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" onClick={handleSave}>
            {t("settings.save")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("settings.load")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleLoad}
          />
        </div>
      </div>

      {/* ── Presets ──────────────────────────────────────────────────── */}
      {presets && presets.length > 0 && (
        <SettingsSection title={t("settings.presets")}>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, i) => (
              <Button
                key={i}
                size="sm"
                variant="secondary"
                onClick={() => preset.apply(ctx)}
                title={preset.label}
                aria-label={preset.label}
                className="flex items-center justify-center px-0 w-7 h-7"
              >
                {preset.icon}
              </Button>
            ))}
          </div>
        </SettingsSection>
      )}

      {/* ── Design Mode ──────────────────────────────────────────────── */}
      {showMode && (
        <SettingsSection title={t("settings.designMode")}>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => (
              <Button
                key={m}
                size="sm"
                variant={ctx.mode === m ? "primary" : "secondary"}
                onClick={() => ctx.setMode(m)}
                className="capitalize"
              >
                {m}
              </Button>
            ))}
          </div>
        </SettingsSection>
      )}

      {/* ── Theme swatches + individual color pickers ─────────────── */}
      {showColors && (
        <SettingsSection title={t("settings.theme")}>
          <div className="flex flex-wrap gap-2">
            {BUILT_IN_THEMES.map((t) => (
              <button
                key={t.id}
                title={t.id}
                onClick={() => ctx.setColors(t.tokens)}
                className={cn(
                  "group flex flex-col items-center gap-1 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
                )}
              >
                <span
                  className="block w-7 h-7 rounded-[calc(var(--radius)*0.75)] border border-white/10"
                  style={{ background: t.tokens["--color-accent"] }}
                />
                <span className="text-[10px] text-fg-muted capitalize">
                  {t.id}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {(Object.keys(ctx.colors) as (keyof ThemeTokens)[]).map((token) => (
              <TokenControl
                key={token}
                name={token}
                value={ctx.colors[token]}
                onChange={(v) => ctx.setTokenValue(token, v)}
              />
            ))}
          </div>
        </SettingsSection>
      )}

      {/* ── Token groups (shape, motion, custom, …) ──────────────── */}
      {Object.entries(groupMap).map(([group, groupKeys]) => (
        <SettingsSection key={group} title={group}>
          <div className="space-y-2">
            {groupKeys.map((name) => (
              <TokenControl
                key={name}
                name={name}
                value={allTokens[name] ?? ""}
                onChange={(v) => ctx.setTokenValue(name, v)}
              />
            ))}
          </div>
        </SettingsSection>
      ))}

      {/* ── App-specific settings slot ─────────────────────────────── */}
      {renderAppSettings && (
        <SettingsSection title={t("settings.appSettings")}>
          {renderAppSettings()}
        </SettingsSection>
      )}
    </div>
  );
}

// ─── SettingsModalButton ──────────────────────────────────────────────────────

export interface SettingsModalButtonProps extends SettingsPanelProps {
  /** Accessible label for the trigger button. Default: "Open settings" */
  label?: string;
  buttonClassName?: string;
}


export function SettingsModalButton({
  label,
  buttonClassName,
  ...panelProps
}: SettingsModalButtonProps) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t("settings.openSettings");
  return (
    <Modal>
      <Modal.Trigger asChild>
        <button
          aria-label={resolvedLabel}
          title={resolvedLabel}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-sm",
            "text-fg-muted hover:text-fg-primary hover:bg-bg-overlay",
            "transition-[color,background-color] duration-(--transition-speed)",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
            buttonClassName,
          )}
        >
          <Settings width={14} height={14} aria-hidden="true" />
        </button>
      </Modal.Trigger>
      <Modal.Content
        aria-label={resolvedLabel}
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <SettingsPanel {...panelProps} />
      </Modal.Content>
    </Modal>
  );
}
