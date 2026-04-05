// ─── CCC Core ─────────────────────────────────────────────────────────────────
export type {
  DesignMode,
  ThemeTokens,
  ShapeConfig,
  MotionConfig,
  DepthConfig,
  C7OneConfig,
  C7OneContextValue,
  ModePreset,
} from "./ccc/types";

// ─── Themes ───────────────────────────────────────────────────────────────────
export { dark, light, midnight, forest, rose, slate } from "./ccc/themes";

// ─── Mode Presets ─────────────────────────────────────────────────────────────
export { classic, neo, glass, minimal } from "./ccc/modes";

// ─── Provider + Hook ──────────────────────────────────────────────────────────
export { C7OneProvider } from "./context/C7OneContext";
export type { C7OneProviderProps } from "./context/C7OneContext";
export { useC7One } from "./context/C7OneContext";

// ─── AppConfig ────────────────────────────────────────────────────────────────
export { AppConfigProvider } from "./context/AppConfigContext";
export type { AppConfigProviderProps } from "./context/AppConfigContext";
export { useAppConfig } from "./context/AppConfigContext";

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { usePanelVisibility } from "./context/PanelContext";

// ─── Utils ────────────────────────────────────────────────────────────────────
export { cn } from "./utils/cn";
export { detectIsDark, buildRandomConfig } from "./utils/colors";
export type { RandomizedConfig } from "./utils/colors";

// ─── Structural Components ────────────────────────────────────────────────────
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  ModalTrigger,
  ModalContent,
  Header,
  Footer,
  Section,
} from "./components/structural";
export type {
  CardProps,
  CardVariant,
  ModalProps,
  HeaderProps,
  SectionProps,
} from "./components/structural";

// ─── Textual Components ───────────────────────────────────────────────────────
export {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Body,
  Code,
  Label,
  Kbd,
  Badge,
} from "./components/textual";
export type {
  BodyProps,
  BodySize,
  CodeProps,
  BadgeProps,
  BadgeVariant,
} from "./components/textual";

// ─── Form Components ──────────────────────────────────────────────────────────
export {
  Button,
  Input,
  Textarea,
  Checkbox,
  Toggle,
  Slider,
  Select,
} from "./components/form";
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  InputProps,
  TextareaProps,
  CheckboxProps,
  ToggleProps,
  SliderProps,
  SelectProps,
  SelectOption,
} from "./components/form";

// ─── Feedback Components ──────────────────────────────────────────────────────
export {
  Alert,
  Spinner,
  Progress,
  Skeleton,
  Toast,
  ToastProvider,
  ToastViewport,
  ToastClose,
} from "./components/feedback";
export type {
  AlertProps,
  AlertVariant,
  SpinnerProps,
  SpinnerSize,
  ProgressProps,
  SkeletonProps,
  ToastProps,
  ToastVariant,
} from "./components/feedback";

// ─── Visual Components ────────────────────────────────────────────────────────
export { Divider, Avatar, A } from "./components/visual";
export type {
  DividerProps,
  AvatarProps,
  AvatarSize,
} from "./components/visual";

// ─── Navigation Components ────────────────────────────────────────────────────
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumb,
} from "./components/navigation";
export type { BreadcrumbProps, BreadcrumbItem } from "./components/navigation";

// ─── Data Components ──────────────────────────────────────────────────────────
export { Table, Pagination } from "./components/data/Table";
export type {
  TableProps,
  ColumnDef,
  PaginationProps,
  SortDirection,
} from "./components/data/Table";

export { List, ListItem } from "./components/data/List";
export type { ListProps, ListItemProps } from "./components/data/List";

export { Gallery, GalleryCard } from "./components/data/Gallery";
export type {
  GalleryProps,
  GalleryCardProps,
  GalleryAspect,
  GalleryCols,
} from "./components/data/Gallery";

export { DataGrid } from "./components/data/DataGrid";
export type { DataGridProps, DataGridColumn } from "./components/data/DataGrid";

// ─── Navigation (full) ────────────────────────────────────────────────────────
export { Navbar, Sidebar } from "./components/navigation/NavSidebar";
export type {
  NavbarProps,
  NavItem,
  SidebarProps,
  SidebarGroup,
} from "./components/navigation/NavSidebar";

// ─── Canvas / Panel System ────────────────────────────────────────────────────
export { PanelRoot, PanelSplit, PanelLeaf } from "./panels";
export type { PanelRootProps, PanelSplitProps, PanelLeafProps } from "./panels";

// ─── Dynamic Panel System ─────────────────────────────────────────────────────
export { DynamicPanelRoot } from "./panels";
export type { DynamicPanelRootProps } from "./panels";
export { WindowSelector } from "./panels";
export type { WindowSelectorProps } from "./panels";
export { useWindowContext } from "./panels";
export type {
  WindowDef,
  PanelTreeNode,
  GroupNode,
  LeafNode,
  SplitDirection,
  LayoutNodeDecl,
  LayoutGroupDecl,
  LayoutLeafDecl,
  WindowContextValue,
} from "./panels";

// ─── Settings Panel ───────────────────────────────────────────────────────────
export { SettingsPanel, SettingsModalButton } from "./settings/SettingsPanel";
export type { SettingsPanelProps, SettingKey, SettingsPreset, SettingsModalButtonProps } from "./settings/SettingsPanel";

// ─── Controls ────────────────────────────────────────────────────────────────
export { RandomizeButton, ThemeToggleButton } from "./components/controls";
export type { RandomizeButtonProps, ThemeToggleButtonProps } from "./components/controls";

// ─── Localization (i18n) ──────────────────────────────────────────────────────
export { I18nProvider, useI18n } from "./i18n/I18nContext";
export type { I18nProviderProps, I18nContextValue } from "./i18n/I18nContext";
export type { Locale, LibMessages } from "./i18n/types";
export { en } from "./i18n/locales/en";
export { uk } from "./i18n/locales/uk";

