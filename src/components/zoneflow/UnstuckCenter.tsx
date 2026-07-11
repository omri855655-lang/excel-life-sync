import { useEffect, useState } from "react";
import { ArrowLeft, BrainCircuit, Check, Footprints, Loader2, RefreshCw, Send, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "zoneflow-unstuck-state";

const barriers = [
  { id: "overwhelm", label: "הכול מרגיש גדול מדי", prompt: "בחר פעולה של פחות משתי דקות" },
  { id: "fear", label: "אני חושש לטעות", prompt: "צור טיוטה מכוערת שאף אחד לא יראה" },
  { id: "unclear", label: "לא ברור לי מאיפה להתחיל", prompt: "כתוב רק מה התוצאה הרצויה במשפט אחד" },
  { id: "energy", label: "אין לי אנרגיה", prompt: "הכן את סביבת העבודה בלבד ועצור" },
] as const;

const route = [
  { title: "להקטין את הכניסה", action: "פתח את הקובץ או המסך שצריך, בלי להתחייב להמשיך." },
  { title: "שתי דקות של תנועה", action: "עשה את החלק הקטן ביותר במשימה במשך שתי דקות בלבד." },
  { title: "לסלק החלטה אחת", action: "בחר מראש זמן, מקום וכלי אחד לביצוע המשימה." },
  { title: "טיוטה לפני איכות", action: "צור גרסה ראשונה לא מושלמת בכוונה." },
  { title: "לשמור על רצף רך", action: "חזור למשימה לחמש דקות, גם אם אתמול לא הסתדר." },
  { title: "לבקש עזרה מדויקת", action: "שלח לאדם אחד שאלה קצרה על החסם המרכזי." },
  { title: "לזהות מה עבד", action: "כתוב פעולה אחת שהקלה עליך להתחיל השבוע." },
] as const;

interface StoredState {
  completedDays: number[];
  barrierId: string;
  intensity: number;
}

const loadState = (): StoredState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { completedDays: [], barrierId: "overwhelm", intensity: 3 };
  } catch {
    return { completedDays: [], barrierId: "overwhelm", intensity: 3 };
  }
};

const UnstuckCenter = () => {
  const [storedState, setStoredState] = useState<StoredState>(loadState);
  const [task, setTask] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const todayIndex = Math.min(storedState.completedDays.length, route.length - 1);
  const selectedBarrier = barriers.find((barrier) => barrier.id === storedState.barrierId) ?? barriers[0];
  const progress = Math.round((storedState.completedDays.length / route.length) * 100);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedState));
  }, [storedState]);

  const toggleToday = () => {
    setStoredState((current) => {
      const completedDays = current.completedDays.includes(todayIndex)
        ? current.completedDays.filter((day) => day !== todayIndex)
        : [...current.completedDays, todayIndex];
      return { ...current, completedDays };
    });
  };

  const askCoach = async () => {
    if (!task.trim()) {
      toast.error("כתוב מה כרגע תקוע");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const { data, error } = await supabase.functions.invoke("task-ai-helper", {
        body: {
          taskDescription: `המשימה: ${task.trim()}\nעוצמת הקושי: ${storedState.intensity}/5\nהחסם המרכזי: ${selectedBarrier.label}`,
          taskCategory: "zoneflow_unstuck",
        },
      });

      if (error) throw error;
      setAnswer(data?.suggestion || "נסה לכתוב את הפעולה הפיזית הקטנה ביותר שאפשר לעשות עכשיו.");
    } catch (error) {
      console.error("ZoneFlow coach error:", error);
      toast.error("המאמן לא זמין כרגע. אפשר להתחיל מהצעד היומי שמופיע למעלה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-auto bg-[radial-gradient(circle_at_top_right,_#d9f5e5_0,_#f4f7f3_42%,_#eef3ed_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_right,_#12352a_0,_#090c0b_48%)] dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-5 p-4 pb-24 sm:p-6">
        <section className="overflow-hidden rounded-[28px] bg-emerald-950 p-6 text-white shadow-xl shadow-emerald-950/15 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
            <div>
              <Badge className="mb-4 border-white/15 bg-white/10 text-emerald-100 hover:bg-white/10">ZONEFLOW RESET</Badge>
              <h2 className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl">לא צריך לסיים הכול. צריך רק להניע צעד אחד.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/80">מרחב עדין להפחתת עומס, פירוק משימה וקבלת כיוון אחד ברור. אין כאן ניקוד על שלמות ואין “חוב” על יום שפספסת.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>המסלול שלך</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/15" />
              <p className="mt-3 text-xs text-emerald-100/70">{storedState.completedDays.length} מתוך {route.length} צעדים הושלמו</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <Card className="border-emerald-950/10 bg-white/90 shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-amber-100 p-3 text-amber-800"><Footprints className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-700">הצעד הבא בלבד</p>
                  <h3 className="text-xl font-black">{route[todayIndex].title}</h3>
                </div>
              </div>
              <p className="rounded-2xl bg-amber-50 p-4 text-base leading-7 text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">{route[todayIndex].action}</p>
              <Button onClick={toggleToday} className={cn("w-full rounded-xl", storedState.completedDays.includes(todayIndex) ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200" : "bg-emerald-800 hover:bg-emerald-700")}>
                {storedState.completedDays.includes(todayIndex) ? <><Check className="h-4 w-4" /> הושלם, אפשר לבטל</> : <><ArrowLeft className="h-4 w-4" /> עשיתי את הצעד</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-emerald-950/10 bg-white/90 shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-cyan-100 p-3 text-cyan-800"><BrainCircuit className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">AI COACH</p>
                  <h3 className="text-xl font-black">מה תקוע עכשיו?</h3>
                </div>
              </div>

              <Textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="לדוגמה: אני צריך לשלוח הצעת מחיר, אבל כל פעם דוחה את הפתיחה של המייל..." className="min-h-[110px] rounded-2xl bg-white dark:bg-black/20" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span>כמה זה מציף כרגע?</span><strong>{storedState.intensity}/5</strong></div>
                <Slider value={[storedState.intensity]} min={1} max={5} step={1} onValueChange={(value) => setStoredState((current) => ({ ...current, intensity: value[0] }))} />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {barriers.map((barrier) => (
                  <button key={barrier.id} type="button" onClick={() => setStoredState((current) => ({ ...current, barrierId: barrier.id }))} className={cn("rounded-xl border p-3 text-right text-sm transition-colors", storedState.barrierId === barrier.id ? "border-cyan-700 bg-cyan-50 text-cyan-950 dark:bg-cyan-400/10 dark:text-cyan-100" : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5")}>
                    {barrier.label}
                  </button>
                ))}
              </div>

              <Button onClick={askCoach} disabled={loading} className="w-full rounded-xl bg-cyan-700 hover:bg-cyan-600">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> בונה צעד ראשון...</> : <><Send className="h-4 w-4" /> פרק לי את זה</>}
              </Button>

              {answer && <div className="whitespace-pre-wrap rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-7 text-cyan-950 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100"><div className="mb-2 flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4" /> הכיוון שלך</div>{answer}</div>}
            </CardContent>
          </Card>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {barriers.map((barrier) => (
            <button key={barrier.id} type="button" onClick={() => setStoredState((current) => ({ ...current, barrierId: barrier.id }))} className={cn("rounded-2xl border p-4 text-right transition-all", storedState.barrierId === barrier.id ? "border-emerald-700 bg-emerald-950 text-white shadow-lg" : "border-emerald-950/10 bg-white/80 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5")}>
              <p className="font-bold">{barrier.label}</p>
              <p className={cn("mt-2 text-xs leading-5", storedState.barrierId === barrier.id ? "text-emerald-100/75" : "text-muted-foreground")}>{barrier.prompt}</p>
            </button>
          ))}
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs leading-5 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
          <p>ZoneFlow הוא כלי תמיכה והתארגנות, לא אבחון או טיפול רפואי. אם יש מצוקה חריפה, סכנה או מחשבות על פגיעה עצמית, יש לפנות מיד לשירותי החירום המקומיים או לאיש מקצוע.</p>
        </div>
      </div>
    </div>
  );
};

export default UnstuckCenter;
