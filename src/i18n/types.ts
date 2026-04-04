// ─── Supported Locales ────────────────────────────────────────────────────────

export type Locale = "en" | "uk";

// ─── Library-internal message keys ───────────────────────────────────────────

export interface LibMessages {
  // SettingsPanel
  "settings.title": string;
  "settings.save": string;
  "settings.load": string;
  "settings.presets": string;
  "settings.designMode": string;
  "settings.theme": string;
  "settings.appSettings": string;
  "settings.openSettings": string;
  // Table / DataGrid empty state
  "data.noData": string;
  // DataGrid footer — supports {count} placeholder
  "data.rows": string;
}
