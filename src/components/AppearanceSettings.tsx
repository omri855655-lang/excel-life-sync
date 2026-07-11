import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBackgroundTheme } from "@/hooks/useBackgroundTheme";
import { cn } from "@/lib/utils";

export const AppearanceSettingsPanel = () => {
  const { backgroundTheme, setBackgroundTheme, backgroundThemeOptions } = useBackgroundTheme();

  return (
    <div className="space-y-4" dir="rtl">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">צבע רקע</h3>
        <p className="text-sm text-muted-foreground">
          בחר צבע רקע כללי. הבחירה נשמרת אוטומטית במכשיר הזה.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {backgroundThemeOptions.map((option) => {
          const isActive = option.id === backgroundTheme;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setBackgroundTheme(option.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-right transition-colors",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-accent/40",
              )}
            >
              <span
                className="h-10 w-10 rounded-full border border-black/5 shadow-sm"
                style={{ backgroundColor: option.preview }}
              />
              <span className="flex flex-col">
                <span className="font-medium text-foreground">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {isActive ? "נבחר כרגע" : "לחץ לבחירה"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AppearanceSettings = () => {
  const { backgroundTheme, backgroundThemeOptions } = useBackgroundTheme();
  const activeThemeLabel =
    backgroundThemeOptions.find((option) => option.id === backgroundTheme)?.label ?? "מותאם אישית";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">תצוגה: {activeThemeLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>הגדרות תצוגה</DialogTitle>
          <DialogDescription>התאם את מראה המערכת.</DialogDescription>
        </DialogHeader>
        <AppearanceSettingsPanel />
      </DialogContent>
    </Dialog>
  );
};

export default AppearanceSettings;
