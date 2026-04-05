import React from "react";
import { Dices } from "lucide-react";
import { useC7One } from "../../context/C7OneContext";
import { detectIsDark, buildRandomConfig } from "../../utils/colors";
import type { RandomizedConfig } from "../../utils/colors";
import { Button } from "../form/Button";
import type { ButtonProps } from "../form/Button";

export interface RandomizeButtonProps
  extends Omit<ButtonProps, "onClick" | "children"> {
  /** 0–100. Controls how chaotic the randomization is. Default: 20. */
  freedom?: number;
  /** Called after each randomization with the generated config. */
  onApply?: (cfg: RandomizedConfig) => void;
  /** Optional label shown after the icon. Omit for icon-only. */
  label?: React.ReactNode;
}

export const RandomizeButton = React.forwardRef<
  HTMLButtonElement,
  RandomizeButtonProps
>(({ freedom = 20, onApply, label, ...props }, ref) => {
  const { colors, setMode, setColors, setShape, setMotion, setDepth } =
    useC7One();

  function handleClick() {
    const isDark = detectIsDark(colors["--color-bg-base"]);
    const cfg = buildRandomConfig(isDark, freedom);
    setMode(cfg.mode);
    setColors(cfg.colors);
    setShape({ radius: cfg.radius, borderWidth: cfg.borderWidth });
    setMotion({ transitionSpeed: cfg.transitionSpeed });
    setDepth({ shadowIntensity: cfg.shadowIntensity });
    onApply?.(cfg);
  }

  return (
    <Button ref={ref} onClick={handleClick} {...props}>
      <Dices width={14} height={14} aria-hidden="true" />
      {label}
    </Button>
  );
});

RandomizeButton.displayName = "RandomizeButton";
