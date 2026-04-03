import "@testing-library/jest-dom";

// Polyfill ResizeObserver for Radix UI components that use @radix-ui/react-use-size
// (e.g. Slider, SettingsPanel with Slider). jsdom does not provide this API.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
