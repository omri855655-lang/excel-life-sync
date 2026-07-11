import { useState } from "react";
import { BrainCircuit, Focus, Orbit } from "lucide-react";
import DeeplyDashboard from "@/components/deeply/DeeplyDashboard";
import UnstuckCenter from "./UnstuckCenter";
import PersonalInsights from "./PersonalInsights";
import { cn } from "@/lib/utils";

const sections = [
  { id: "focus", label: "פוקוס", description: "טיימר, צלילים ומשימות", icon: Focus },
  { id: "unstuck", label: "יציאה מקיפאון", description: "צעד קטן וליווי AI", icon: BrainCircuit },
  { id: "insights", label: "מפה אישית", description: "נומרולוגיה והורוסקופ יומי", icon: Orbit },
] as const;

type SectionId = (typeof sections)[number]["id"];

const ZoneFlowDashboard = () => {
  const [activeSection, setActiveSection] = useState<SectionId>("focus");

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f4f7f3] dark:bg-[#090c0b]" dir="rtl">
      <div className="flex-shrink-0 border-b border-emerald-950/10 bg-white/90 px-3 py-3 backdrop-blur dark:border-white/10 dark:bg-[#101513]/95">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex min-w-[155px] flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-right transition-all",
                  isActive
                    ? "border-emerald-700 bg-emerald-950 text-white shadow-lg shadow-emerald-950/15"
                    : "border-emerald-950/10 bg-white text-slate-700 hover:border-emerald-700/30 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
                )}
              >
                <span className={cn("rounded-xl p-2", isActive ? "bg-white/10" : "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-300")}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-bold">{section.label}</span>
                  <span className={cn("block text-[11px]", isActive ? "text-emerald-100" : "text-muted-foreground")}>{section.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {activeSection === "focus" && <DeeplyDashboard />}
        {activeSection === "unstuck" && <UnstuckCenter />}
        {activeSection === "insights" && <PersonalInsights />}
      </div>
    </div>
  );
};

export default ZoneFlowDashboard;
