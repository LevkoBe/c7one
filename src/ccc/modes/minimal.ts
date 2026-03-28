import type { ModePreset } from '../types'

/** Max radius, zero borders, zero shadow */
export const minimal: ModePreset = {
  tokens: {
    '--radius':           '1rem',
    '--border-width':     '0px',
    '--transition-speed': '150ms',
    '--shadow-intensity': '0',
  },
  className: 'design-minimal',
}
