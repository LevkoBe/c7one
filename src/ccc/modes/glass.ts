import type { ModePreset } from '../types'

/** backdrop-filter blur, semi-transparent surfaces */
export const glass: ModePreset = {
  tokens: {
    '--radius':           '0.75rem',
    '--border-width':     '1px',
    '--transition-speed': '220ms',
    '--shadow-intensity': '0.5',
  },
  className: 'design-glass',
}
