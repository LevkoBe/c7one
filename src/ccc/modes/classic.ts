import type { ModePreset } from "../types";

/** Flat, clean, no elevation or blur effects */
export const classic: ModePreset = {
  tokens: {
    "--radius": "0.375rem",
    "--border-width": "1px",
    "--transition-speed": "200ms",
    "--shadow-intensity": "0",
  },
};
