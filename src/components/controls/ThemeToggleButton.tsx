import React from "react";
import { Sun, Moon } from "lucide-react";
import { useC7One } from "../../context/C7OneContext";
import { detectIsDark } from "../../utils/colors";
import type { ThemeTokens } from "../../ccc/types";
import { Button } from "../form/Button";
import type { ButtonProps } from "../form/Button";

export interface ThemeToggleButtonProps
  extends Omit<ButtonProps, "onClick" | "children"> {
  /** Colors applied when switching to dark mode. */
  dark: ThemeTokens;
  /** Colors applied when switching to light mode. */
  light: ThemeTokens;
  /** Override the icon/label shown in dark mode (current theme is dark → clicking goes light). */
  darkIcon?: React.ReactNode;
  /** Override the icon/label shown in light mode (current theme is light → clicking goes dark). */
  lightIcon?: React.ReactNode;
}

export const ThemeToggleButton = React.forwardRef<
  HTMLButtonElement,
  ThemeToggleButtonProps
>(
  (
    {
      dark,
      light,
      darkIcon  = <Sun  width={14} height={14} aria-hidden="true" />,
      lightIcon = <Moon width={14} height={14} aria-hidden="true" />,
      ...props
    },
    ref,
  ) => {
    const { colors, setColors } = useC7One();
    const isDark = detectIsDark(colors["--color-bg-base"]);

    function handleClick() {
      setColors(isDark ? light : dark);
    }

    return (
      <Button ref={ref} onClick={handleClick} {...props}>
        {isDark ? darkIcon : lightIcon}
      </Button>
    );
  },
);

ThemeToggleButton.displayName = "ThemeToggleButton";
