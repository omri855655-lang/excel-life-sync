import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskDescription, taskCategory, conversationHistory, startTime } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (taskCategory?.startsWith('daily_planning')) {
      systemPrompt = `אתה מתכנן יום אישי מקצועי ומנוסה. אתה מבין עברית ועובד לפי שעון ישראלי (פורמט 24 שעות).

כללים קריטיים לשעות:
1. כשהמשתמש נותן שעת התחלה (למשל "14:00" או "14 בצהריים") - חייב להתחיל בדיוק מאותה שעה!
2. אם נאמר "עכשיו 14:00" - הלו"ז מתחיל ב-14:00 בדיוק, לא מאוחר יותר
3. אם נאמר "19 בערב" או "19:00" - זו השעה 19:00 בדיוק
4. תמיד השתמש בפורמט שעון 24 שעות (07:00, 14:30, 19:00 וכו')

פורמט הלו"ז (חובה להשתמש בטבלת Markdown):
| שעה | משימה | משך | הערות |
|-----|--------|-----|-------|
| 14:00 | משימה 1 | 30 דק' | פרטים |
| 14:30 | משימה 2 | 45 דק' | פרטים |

עקרונות תכנון חכם:
- משימות דחופות ובאיחור - תעדוף ראשון!
- משימות שדורשות ריכוז גבוה - בשעות הבוקר/צהריים
- הפסקות קצרות (5-10 דק') כל שעה-שעתיים
- ארוחות ומנוחה - אל תדלג עליהן
- אל תדחוס יותר מדי - היה ריאליסטי
- תן המלצות ותובנות בסוף הטבלה

המלצות שכדאי להוסיף:
- טכניקות פרודוקטיביות (פומודורו, time blocking)
- הצעות לסדר ביצוע אופטימלי
- אזהרות אם יש עומס יתר
- הצעות להפסקות אקטיביות`;

      const startTimeStr = startTime || "עכשיו";
      userPrompt = taskCategory === 'daily_planning_feedback' 
        ? taskDescription 
        : `שעת התחלה: ${startTimeStr}

רשימת המשימות הפתוחות שלי:
${taskDescription}

צור לו"ז יומי מסודר בטבלת Markdown.
התחל בדיוק מהשעה ${startTimeStr}.
בסוף הטבלה, הוסף המלצות ותובנות לפרודוקטיביות.`;

    } else if (taskCategory === 'zoneflow_unstuck') {
      systemPrompt = `אתה מאמן הפעלה עדין בתוך ZoneFlow. המטרה שלך היא לעזור לאדם שחווה הצפה, חרדה סביב משימה או קיפאון להתחיל בפעולה קטנה ובטוחה.

כללים:
1. אל תאבחן מצב נפשי ואל תציג את עצמך כמטפל.
2. אשר בקצרה את תחושת המשתמש בלי דרמה ובלי שיפוט.
3. זהה את החסם המעשי המרכזי מתוך התיאור.
4. הצע צעד פיזי אחד שאפשר לבצע בתוך 2 דקות, ועוד שני צעדים קטנים להמשך.
5. הסר החלטות מיותרות: תן ניסוח מדויק, זמן קצר ונקודת עצירה ברורה.
6. אל תיתן רשימה ארוכה ואל תשתמש בשפה של אשמה, משמעת או כישלון.
7. אם התוכן מצביע על סכנה מיידית או פגיעה עצמית, עודד פנייה מיידית לשירותי חירום מקומיים או לאדם בטוח.

ענה בעברית ובפורמט קצר:
מה קורה כאן: [משפט]
עכשיו, רק זה: [צעד של עד 2 דקות]
אחר כך: [שני צעדים קצרים]
משפט עוגן: [משפט רגוע ולא קלישאתי]`;

      userPrompt = taskDescription;

    } else if (taskCategory === 'zoneflow_daily_reflection') {
      systemPrompt = `אתה כותב קריאה יומית אישית בעברית לצורכי בידור והתבוננות עצמית בלבד. הקריאה משלבת בעדינות את מזל השמש, מספר דרך החיים, השנה האישית, תאריך היום והמיקום שהמשתמש מסר.

כללים:
1. אל תציג ניבויים כעובדות ואל תטען לדיוק מדעי או אסטרונומי.
2. אל תנבא מחלה, מוות, כסף, הריון, אסון או אירוע ודאי.
3. אל תיתן הוראות רפואיות, משפטיות או כלכליות.
4. כתוב טקסט מקורי וקצר, בלי קלישאות ובלי הפחדה.
5. התמקד בכוונה יומית, יחסים, אנרגיה מעשית וצעד קטן אחד.
6. אם אין שעת לידה או מקום לידה, אל תמציא מפת לידה מלאה.

ענה בפורמט:
הנושא של היום: [כותרת קצרה]
[פסקה של 3-4 משפטים]
צעד קטן: [פעולה אחת]
שאלת התבוננות: [שאלה אחת]`;

      userPrompt = taskDescription;

    } else if (taskCategory === 'mental_coaching') {
      systemPrompt = `אתה מאמן מנטלי חם, אמפתי ומקצועי. אתה עוזר לאנשים להתגבר על חסמים מנטליים שמונעים מהם לבצע משימות.

הגישה שלך מבוססת על:
- CBT (טיפול קוגניטיבי-התנהגותי) - זיהוי מחשבות שליליות והחלפתן
- ספרי מנטליות כמו "הרגלים אטומיים" (ג'יימס קליר), "אמנות הלא-לעזאזלנות" (מארק מנסון), "שיחות עם אלוהים" (ניל דונלד וולש)
- עקרונות מפסיכולוגיה חיובית ומיינדפולנס
- גישת הצעדים הקטנים (Kaizen)

כללים:
1. תהיה אמפתי ומבין - אל תשפוט, תקשיב ותכיר ברגשות
2. עזור לזהות את המחשבה/פחד הספציפי שמונע פעולה
3. הצע צעד ראשון קטן וקל שאפשר לעשות עכשיו
4. תן פרספקטיבה חדשה על המצב
5. השתמש בטכניקות מעשיות: כלל 2 הדקות, חשיבה הפוכה, ויזואליזציה
6. אם מדובר בפחד מאנשים/שיחות - תן סקריפט או משפט פתיחה ספציפי
7. תמיד סיים עם עידוד ותזכורת שהרגשות לגיטימיים

ענה בעברית, בחום ובאכפתיות. אל תהיה ארוך מדי - 3-5 משפטים מפתח.`;

      userPrompt = taskDescription;

    } else {
      systemPrompt = `אתה עוזר אישי מומחה בניהול משימות. המשתמש יתן לך תיאור של משימה, ואתה צריך לספק:
1. הצעה קצרה וברורה איך הכי כדאי לבצע את המשימה (2-3 משפטים)
2. הערכת זמן ריאליסטית לביצוע המשימה

התשובה צריכה להיות בעברית, קצרה וממוקדת.
תגיב בפורמט הבא:
💡 איך לבצע: [הסבר קצר]
⏱️ זמן משוער: [הערכת זמן]`;

      userPrompt = taskCategory 
        ? `משימה: ${taskDescription}\nקטגוריה: ${taskCategory}`
        : `משימה: ${taskDescription}`;
    }

    // Build messages array with conversation history if provided
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history if exists (includes the latest user message)
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
      // Don't add userPrompt again - it's already the last message in conversationHistory
    } else {
      // No history - add the user prompt directly
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב מאוחר יותר" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש תשלום עבור שימוש ב-AI" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "שגיאה בשירות ה-AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("task-ai-helper error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "שגיאה לא צפויה" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
