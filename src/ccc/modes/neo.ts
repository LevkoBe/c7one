import type { ModePreset } from "../types";

/** Elevated shadows, soft radius, deeper borders */
export const neo: ModePreset = {
  tokens: {
    "--radius": "0.625rem",
    "--border-width": "2px",
    "--transition-speed": "180ms",
    "--shadow-intensity": "1",
  },
  className: "design-neo",
};
