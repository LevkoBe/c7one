import React from "react";
import { useC7One } from "../context/C7OneContext";
import type { DesignMode, ThemeTokens } from "../ccc/types";
import * as themes from "../ccc/themes";
import { cn } from "../utils/cn";
import { Card } from "../components/structural/Card";
import { Label } from "../components/textual/Typography";
import { Slider } from "../components/form/FormControls";
import { Button } from "../components/form/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SettingKey =
  | "colors"
  | "mode"
  | "shape.radius"
  | "shape.borderWidth"
  | "motion.transitionSpeed"
  | "depth.shadowIntensity"
  | `tokens.${string}`;

export interface SettingsPanelProps {
  expose?: SettingKey[];
  renderAppSettings?: () => React.ReactNode;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MODES: DesignMode[] = ["classic", "neo", "glass", "minimal"];

const BUILT_IN_THEMES: { id: string; tokens: ThemeTokens }[] = [
  { id: "dark", tokens: themes.dark },
  { id: "light", tokens: themes.light },
  { id: "midnight", tokens: themes.midnight },
  { id: "forest", tokens: themes.forest },
  { id: "rose", tokens: themes.rose },
  { id: "slate", tokens: themes.slate },
];

const COLOR_TOKENS = [
  "--color-bg-base",
  "--color-bg-elevated",
  "--color-bg-overlay",
  "--color-fg-primary",
  "--color-fg-muted",
  "--color-fg-disabled",
  "--color-accent",
  "--color-accent-hover",
  "--color-success",
  "--color-warning",
  "--color-error",
  "--color-border",
] as const;

function isExposed(expose: SettingKey[] | undefined, key: SettingKey): boolean {
  if (!expose) return true;
  return expose.includes(key);
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

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
  renderAppSettings,
  className,
}: SettingsPanelProps) {
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
  } = useC7One();

  // Parse radius numeric value for slider (strips 'rem')
  const radiusNum = parseFloat(shape.radius) || 0.375;
  const speedNum = parseInt(motion.transitionSpeed) || 200;

  return (
    <Card
      className={cn("w-72 overflow-y-auto max-h-screen", className)}
      variant="elevated"
    >
      <p className="text-sm font-semibold text-fg-primary mb-5">Settings</p>

      {/* ── Design Mode ──────────────────────────────────────────────── */}
      {isExposed(expose, "mode") && (
        <SettingsSection title="Design Mode">
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "primary" : "secondary"}
                onClick={() => setMode(m)}
                className="capitalize"
              >
                {m}
              </Button>
            ))}
          </div>
        </SettingsSection>
      )}

      {/* ── Color Themes ──────────────────────────────────────────────── */}
      {isExposed(expose, "colors") && (
        <SettingsSection title="Theme">
          <div className="flex flex-wrap gap-2">
            {BUILT_IN_THEMES.map((t) => (
              <button
                key={t.id}
                title={t.id}
                onClick={() => setColors(t.tokens)}
                className={cn(
                  "group flex flex-col items-center gap-1 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
                )}
              >
                {/* mini swatch */}
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

          {/* Individual color pickers */}
          <div className="mt-3 space-y-2">
            {COLOR_TOKENS.map((token) => (
              <div
                key={token}
                className="flex items-center justify-between gap-2"
              >
                <Label
                  className="text-[10px] text-fg-muted truncate flex-1"
                  title={token}
                >
                  {token.replace("--color-", "")}
                </Label>
                <input
                  type="color"
                  value={colors[token as keyof ThemeTokens] ?? "#000000"}
                  onChange={(e) =>
                    setColors({
                      [token]: e.target.value,
                    } as Partial<ThemeTokens>)
                  }
                  className="h-6 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  title={token}
                />
              </div>
            ))}
          </div>
        </SettingsSection>
      )}

      {/* ── Shape ─────────────────────────────────────────────────────── */}
      {(isExposed(expose, "shape.radius") ||
        isExposed(expose, "shape.borderWidth")) && (
        <SettingsSection title="Shape">
          {isExposed(expose, "shape.radius") && (
            <div className="mb-3">
              <Label className="text-xs text-fg-muted mb-1.5 block">
                Radius — {radiusNum.toFixed(2)}rem
              </Label>
              <Slider
                min={0}
                max={200}
                step={1}
                value={[Math.round(radiusNum * 100)]}
                onValueChange={([v]) =>
                  setShape({ radius: `${(v / 100).toFixed(2)}rem` })
                }
              />
            </div>
          )}
          {isExposed(expose, "shape.borderWidth") && (
            <div>
              <Label className="text-xs text-fg-muted mb-1.5 block">
                Border — {shape.borderWidth}
              </Label>
              <div className="flex gap-1.5">
                {["0px", "1px", "2px", "3px"].map((w) => (
                  <Button
                    key={w}
                    size="sm"
                    variant={shape.borderWidth === w ? "primary" : "secondary"}
                    onClick={() => setShape({ borderWidth: w })}
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SettingsSection>
      )}

      {/* ── Motion ────────────────────────────────────────────────────── */}
      {isExposed(expose, "motion.transitionSpeed") && (
        <SettingsSection title="Motion">
          <Label className="text-xs text-fg-muted mb-1.5 block">
            Speed — {speedNum}ms
          </Label>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={[speedNum]}
            onValueChange={([v]) => setMotion({ transitionSpeed: `${v}ms` })}
          />
        </SettingsSection>
      )}

      {/* ── Depth ─────────────────────────────────────────────────────── */}
      {isExposed(expose, "depth.shadowIntensity") && (
        <SettingsSection title="Depth">
          <Label className="text-xs text-fg-muted mb-1.5 block">
            Shadow — {depth.shadowIntensity.toFixed(1)}
          </Label>
          <Slider
            min={0}
            max={20}
            step={1}
            value={[Math.round(depth.shadowIntensity * 10)]}
            onValueChange={([v]) => setDepth({ shadowIntensity: v / 10 })}
          />
        </SettingsSection>
      )}

      {/* ── App-specific settings slot ─────────────────────────────────── */}
      {renderAppSettings && (
        <SettingsSection title="App Settings">
          {renderAppSettings()}
        </SettingsSection>
      )}
    </Card>
  );
}
