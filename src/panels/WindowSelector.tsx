import { useWindowContext } from "./WindowContext";
import { cn } from "../utils/cn";

export interface WindowSelectorProps {
  leafId: string;
}

export function WindowSelector({ leafId }: WindowSelectorProps) {
  const { windows, assignWindow } = useWindowContext();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
      <span className="text-xs font-semibold uppercase tracking-widest text-fg-disabled">
        Select a window
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-sm">
        {windows.map((win) => (
          <button
            key={win.id}
            onClick={() => assignWindow(leafId, win.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-radius",
              "border border-border bg-bg-elevated",
              "hover:border-accent hover:bg-bg-overlay",
              "transition-[background-color,border-color] duration-transition-speed",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
              "text-fg-primary cursor-pointer",
            )}
          >
            {win.icon && (
              <span className="w-6 h-6 text-fg-muted flex items-center justify-center">
                {win.icon}
              </span>
            )}
            <span className="text-xs font-medium truncate w-full text-center">
              {win.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
