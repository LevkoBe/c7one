/**
 * Injects a map of CSS custom properties directly onto :root.
 * Zero re-render cost — updates are instant and inherited everywhere.
 */
export function injectVars(tokens: Record<string, string>): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
}

export function injectVar(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value);
}

/** Swap design-mode class on :root (only one at a time) */
const MODE_CLASSES = ["design-neo", "design-glass", "design-minimal"];

export function applyModeClass(className?: string): void {
  const root = document.documentElement;
  root.classList.remove(...MODE_CLASSES);
  if (className) root.classList.add(className);
}
