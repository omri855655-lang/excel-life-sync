import { useEffect, useState } from "react";
import { CalendarDays, Compass, Loader2, MapPin, MoonStar, Orbit, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROFILE_KEY = "zoneflow-personal-map-profile";
const READING_KEY = "zoneflow-daily-reading";

interface PersonalProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  currentCity: string;
}

interface CachedReading {
  date: string;
  profileSignature: string;
  content: string;
}

const defaultProfile: PersonalProfile = { name: "", birthDate: "", birthTime: "", birthPlace: "", currentCity: "" };

const reduceNumber = (value: number): number => {
  if ([11, 22, 33].includes(value)) return value;
  if (value < 10) return value;
  return reduceNumber(String(value).split("").reduce((sum, digit) => sum + Number(digit), 0));
};

const getLifePath = (birthDate: string) => reduceNumber(birthDate.replace(/\D/g, "").split("").reduce((sum, digit) => sum + Number(digit), 0));
const getBirthdayNumber = (birthDate: string) => reduceNumber(Number(birthDate.split("-")[2] || 0));
const getPersonalYear = (birthDate: string) => {
  const [, month = "0", day = "0"] = birthDate.split("-");
  return reduceNumber(Number(month) + Number(day) + new Date().getFullYear());
};

const getZodiac = (birthDate: string) => {
  const [, monthValue, dayValue] = birthDate.split("-").map(Number);
  const value = monthValue * 100 + dayValue;
  if (value >= 321 && value <= 419) return "טלה";
  if (value >= 420 && value <= 520) return "שור";
  if (value >= 521 && value <= 620) return "תאומים";
  if (value >= 621 && value <= 722) return "סרטן";
  if (value >= 723 && value <= 822) return "אריה";
  if (value >= 823 && value <= 922) return "בתולה";
  if (value >= 923 && value <= 1022) return "מאזניים";
  if (value >= 1023 && value <= 1121) return "עקרב";
  if (value >= 1122 && value <= 1221) return "קשת";
  if (value >= 1222 || value <= 119) return "גדי";
  if (value >= 120 && value <= 218) return "דלי";
  return "דגים";
};

const numberMeanings: Record<number, string> = {
  1: "יוזמה, עצמאות ויצירת דרך משלך",
  2: "שיתוף פעולה, רגישות והקשבה",
  3: "ביטוי, יצירתיות ותקשורת",
  4: "יציבות, בנייה וסדר מעשי",
  5: "שינוי, חופש וסקרנות",
  6: "אחריות, קשר וטיפוח",
  7: "עומק, חקירה והתבוננות",
  8: "השפעה, הישג וניהול משאבים",
  9: "חמלה, סיום מעגל וראייה רחבה",
  11: "אינטואיציה, השראה ורגישות גבוהה",
  22: "חזון גדול שמקבל צורה מעשית",
  33: "נתינה, חמלה והובלה דרך שירות",
};

const loadProfile = (): PersonalProfile => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") || defaultProfile;
  } catch {
    return defaultProfile;
  }
};

const PersonalInsights = () => {
  const [profile, setProfile] = useState<PersonalProfile>(loadProfile);
  const [savedProfile, setSavedProfile] = useState<PersonalProfile>(loadProfile);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const hasMap = Boolean(savedProfile.birthDate);
  const lifePath = hasMap ? getLifePath(savedProfile.birthDate) : 0;
  const birthdayNumber = hasMap ? getBirthdayNumber(savedProfile.birthDate) : 0;
  const personalYear = hasMap ? getPersonalYear(savedProfile.birthDate) : 0;
  const zodiac = hasMap ? getZodiac(savedProfile.birthDate) : "";
  const signature = JSON.stringify(savedProfile);

  useEffect(() => {
    try {
      const cached: CachedReading | null = JSON.parse(localStorage.getItem(READING_KEY) || "null");
      if (cached?.date === today && cached.profileSignature === signature) setReading(cached.content);
      else setReading("");
    } catch {
      setReading("");
    }
  }, [signature, today]);

  const saveProfile = () => {
    if (!profile.birthDate) {
      toast.error("נדרש תאריך לידה כדי לבנות מפה אישית");
      return;
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSavedProfile(profile);
    toast.success("הפרופיל האישי נשמר במכשיר");
  };

  const generateReading = async () => {
    if (!hasMap) {
      toast.error("שמור קודם את פרטי הלידה");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("task-ai-helper", {
        body: {
          taskCategory: "zoneflow_daily_reflection",
          taskDescription: `תאריך היום: ${today}\nשם: ${savedProfile.name || "לא צוין"}\nתאריך לידה: ${savedProfile.birthDate}\nשעת לידה: ${savedProfile.birthTime || "לא צוינה"}\nמקום לידה: ${savedProfile.birthPlace || "לא צוין"}\nמקום מגורים: ${savedProfile.currentCity || "לא צוין"}\nמזל שמש: ${zodiac}\nמספר דרך חיים: ${lifePath}\nשנה אישית: ${personalYear}`,
        },
      });
      if (error) throw error;
      const content = data?.suggestion || "היום מתאים לבחור כוונה אחת קטנה ולתת לה מקום לפני שמוסיפים עומס חדש.";
      setReading(content);
      localStorage.setItem(READING_KEY, JSON.stringify({ date: today, profileSignature: signature, content } satisfies CachedReading));
    } catch (error) {
      console.error("Daily reflection error:", error);
      toast.error("לא הצלחתי ליצור את הקריאה היומית כרגע");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-auto bg-[#11100d] text-[#f7f1df]">
      <div className="mx-auto max-w-6xl space-y-5 p-4 pb-24 sm:p-6">
        <section className="relative overflow-hidden rounded-[30px] border border-amber-200/15 bg-[radial-gradient(circle_at_18%_10%,_#69592e_0,_#211f19_38%,_#11100d_75%)] p-6 sm:p-8">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full border border-amber-200/15" />
          <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full border border-amber-200/10" />
          <Badge className="mb-4 border-amber-200/20 bg-amber-200/10 text-amber-100 hover:bg-amber-200/10">PERSONAL COMPASS</Badge>
          <h2 className="max-w-2xl text-3xl font-black sm:text-4xl">מפה אישית להתבוננות, לא לניבוי גורל.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50/65">שילוב של מספרי לידה, מזל שמש וקריאה יומית מותאמת לפרטים שתבחר לשמור. הפרטים נשמרים כרגע רק במכשיר הזה.</p>
        </section>

        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <Card className="border-amber-200/10 bg-[#1c1a15] text-[#f7f1df]">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-3"><span className="rounded-2xl bg-amber-200/10 p-3 text-amber-200"><Compass className="h-5 w-5" /></span><div><p className="text-xs font-bold tracking-[.18em] text-amber-200/60">הפרטים שלך</p><h3 className="text-xl font-black">בניית המפה</h3></div></div>
              <div className="space-y-2"><Label htmlFor="zoneflow-name">שם</Label><Input id="zoneflow-name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="השם שלך" className="border-white/10 bg-white/5" /></div>
              <div className="space-y-2"><Label htmlFor="zoneflow-birth-date">תאריך לידה</Label><Input id="zoneflow-birth-date" type="date" value={profile.birthDate} onChange={(event) => setProfile({ ...profile, birthDate: event.target.value })} className="border-white/10 bg-white/5" /></div>
              <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="zoneflow-birth-time">שעת לידה</Label><Input id="zoneflow-birth-time" type="time" value={profile.birthTime} onChange={(event) => setProfile({ ...profile, birthTime: event.target.value })} className="border-white/10 bg-white/5" /></div><div className="space-y-2"><Label htmlFor="zoneflow-birth-place">מקום לידה</Label><Input id="zoneflow-birth-place" value={profile.birthPlace} onChange={(event) => setProfile({ ...profile, birthPlace: event.target.value })} placeholder="עיר ומדינה" className="border-white/10 bg-white/5" /></div></div>
              <div className="space-y-2"><Label htmlFor="zoneflow-current-city">מקום מגורים</Label><div className="relative"><MapPin className="absolute right-3 top-3 h-4 w-4 text-amber-200/40" /><Input id="zoneflow-current-city" value={profile.currentCity} onChange={(event) => setProfile({ ...profile, currentCity: event.target.value })} placeholder="עיר נוכחית" className="border-white/10 bg-white/5 pr-9" /></div></div>
              <Button onClick={saveProfile} className="w-full bg-amber-200 text-stone-950 hover:bg-amber-100"><Save className="h-4 w-4" /> שמור ובנה מפה</Button>
            </CardContent>
          </Card>

          <div className="space-y-5">
            {hasMap ? (
              <>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[{ label: "דרך החיים", value: lifePath, detail: numberMeanings[lifePath] }, { label: "מספר יום הלידה", value: birthdayNumber, detail: numberMeanings[birthdayNumber] }, { label: "השנה האישית", value: personalYear, detail: numberMeanings[personalYear] }, { label: "מזל השמש", value: zodiac, detail: "המזל נקבע לפי תאריך הלידה בלבד" }].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-amber-200/10 bg-white/5 p-4"><p className="text-xs text-amber-100/50">{item.label}</p><p className="mt-2 text-3xl font-black text-amber-100">{item.value}</p><p className="mt-2 text-xs leading-5 text-amber-50/55">{item.detail}</p></div>
                  ))}
                </section>

                <Card className="overflow-hidden border-amber-200/15 bg-gradient-to-br from-[#2f2a1d] to-[#171611] text-[#f7f1df]">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-3"><span className="rounded-2xl bg-amber-200/10 p-3 text-amber-200"><MoonStar className="h-5 w-5" /></span><div className="flex-1"><p className="text-xs font-bold tracking-[.18em] text-amber-200/55">{today}</p><h3 className="text-xl font-black">הקריאה היומית שלך</h3></div></div>
                    {reading ? <div className="mt-5 whitespace-pre-wrap rounded-2xl border border-amber-200/10 bg-black/15 p-4 text-sm leading-7 text-amber-50/85">{reading}</div> : <p className="mt-5 text-sm leading-6 text-amber-50/55">הקריאה מתחלפת בכל יום ונבנית מהפרופיל השמור. לחץ כדי ליצור את הקריאה של היום.</p>}
                    <Button onClick={generateReading} disabled={loading} className="mt-5 w-full bg-amber-200 text-stone-950 hover:bg-amber-100">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> יוצר קריאה...</> : <><Sparkles className="h-4 w-4" /> {reading ? "צור קריאה מחדש" : "צור קריאה להיום"}</>}</Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-amber-200/20 bg-white/[.03] p-8 text-center"><Orbit className="h-12 w-12 text-amber-200/50" /><h3 className="mt-4 text-xl font-black">המפה מחכה לפרטי הלידה</h3><p className="mt-2 max-w-md text-sm leading-6 text-amber-50/50">הזן לפחות תאריך לידה ושמור. שעת ומקום הלידה ישמשו להעמקת הקריאה האישית, אך גרסה זו אינה מחשבת מיקומי כוכבים אסטרונומיים.</p></div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/10 bg-white/[.03] p-4 text-xs leading-5 text-amber-50/50"><CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0" /><p>נומרולוגיה והורוסקופ אינם כלים מדעיים או רפואיים. התוכן כאן מיועד לבידור ולהתבוננות עצמית בלבד, ולא לקבלת החלטות רפואיות, כלכליות או משמעותיות.</p></div>
      </div>
    </div>
  );
};

export default PersonalInsights;
