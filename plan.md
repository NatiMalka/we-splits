הנה מסמך PRD (Product Requirement Document) מפורט ומובנה, המותאם מראש להעברה לסוכן AI (כמו Cursor, Claude Code, Windsurf וכדומה) כדי שיבצע את כל תהליך הפיתוח מקצה לקצה.

---

# 📄 Product Requirement Document (PRD)

## Project Name: BillSplitter AI (שם זמני: "מתחלקים")

**Type:** Mobile-First Web Application

**Target Architecture:** React / Tailwind CSS + Firebase (Hosting, Firestore, Cloud Functions) + Gemini API (Vision)

---

## 1. סקירת מוצר וחזון (Product Overview)

אפליקציית ווב (Web App) המיועדת לשימוש בנייד, המאפשרת לקבוצת סועדים במסעדה לחלק את החשבון במהירות ובלי חיכוך.

**זרימת העבודה (Core Flow):**

1. סועד אחד מצלם את החשבונית.
2. המערכת מנתחת את החשבונית באמצעות Gemini Vision API ומחלצת את המנות, הסטטוסים, הכמויות והמחירים ל-JSON מובנה.
3. נוצר "חדר" (Session) אליו מצטרפים שאר הסועדים באמצעות סריקת QR או לחיצה על לינק (ללא הרשמה/הורדה).
4. כל סועד מסמן מה אכל (כולל חלוקת מנות משותפות).
5. המערכת מחשבת לכל סועד את הסכום המדויק כולל חיובי שירות/טיפ, ומציגה סיכום לתשלום (כולל לינק/אפשרות להעברה).

---

## 2. ארכיטקטורה וטכנולוגיות (Tech Stack)

* **Frontend:** React (Next.js / Vite), Tailwind CSS (Mobile-First UI), Lucide Icons / Heroicons.
* **Backend / BaaS:** Firebase
* **Firebase Hosting:** אירוח ה-Web App.
* **Firebase Firestore:** סנכרון בזמן אמת (Realtime Subscriptions) של החדר והמצב (State) בין כל הסועדים.
* **Firebase Cloud Functions (Node.js):** אבטחת ה-API Key של Gemini והרצת שיחות ה-AI.


* **AI Engine:** Google Gemini Flash API (`gemini-1.5-flash` או `gemini-2.0-flash`) עם Structured Output (JSON Schema).

---

## 3. מבנה נתונים (Firestore Data Model)

### Collection: `rooms`

```json
{
  "roomId": "string (6 characters code, e.g. 'A7K9PX')",
  "createdAt": "timestamp",
  "status": "string ('scanning' | 'active' | 'completed')",
  "billData": {
    "restaurantName": "string",
    "currency": "string (default: 'ILS')",
    "serviceFee": "number (default: 0)",
    "rawTotal": "number",
    "items": [
      {
        "id": "string (uuid)",
        "name": "string",
        "quantity": "number",
        "price": "number"
      }
    ]
  },
  "settings": {
    "defaultTipPercentage": "number (e.g., 12)",
    "includeServiceInSplit": "boolean"
  },
  "participants": {
    "participantId_1": {
      "name": "string",
      "selections": [
        {
          "itemId": "string",
          "share": "number (e.g. 1 for full item, 0.5 for shared by 2)"
        }
      ],
      "customTipPercentage": "number",
      "totalAmount": "number"
    }
  }
}

```

---

## 4. דרישות פונקציונליות ותזרימי משתמש (User Flows & Specs)

### Flow 1: העלאת חשבונית וניתוח AI (Host Flow)

* **מסך ראשון:** כפתור בולט "צלם/העלה חשבונית".
* **Camera Capture:** פתיחת המצלמה בנייד או העלאת תמונה.
* **Processing State:** הצגת ספינר / אינדיקציית טעינה ("מנתח את המנות והמחירים...").
* **Backend Call:** התמונה נשלחת ל-Cloud Function שקוראת ל-Gemini Flash API.
* **Review & Edit Modal:**
* מציג את רשימת המנות והמחירים שחולצו.
* מאפשר למארח (Host) לערוך/להוסיף/למחוק מנה במידה וה-AI פספס.
* הגדרת אחוז טיפ מבוקש (ברירת מחדל 12% או לפי סעיף שירות בחשבונית).


* **Create Room:** לחיצה על "פתח חדר לסועדים".

### Flow 2: יצירת חדר ושיתוף (Room Sharing)

* המערכת מייצרת `roomId` ייחודי ורשומה ב-Firestore.
* במסך המארח מופיעים:
* **קוד QR גדול** לסריקה מהירה מהנייד של הסועדים לידו.
* כפתור **"עתק לינק לשיתוף"** (לשליחה ב-WhatsApp).



### Flow 3: הצטרפות ובחירת מנות (Participant Flow)

* **Guest Onboarding:** כניסה דרך הלינק/QR -> הזנת שם פרטי בלבד (ללא הרשמה/אימייל).
* **Live Menu Display:**
* הצגת רשימת המנות בחשבונית בזמן אמת.
* ליד כל מנה מופיע: שם, מחיר, וכפתור בחירה/חלוקה.


* **Shared Dishes (מנות משותפות):**
* אם משתמש אחד מסמן מנה, מופיע האייקון/שם שלו ליד המנה.
* אם משתמש נוסף מסמן את אותה המנה, המערכת מחלקת את מחיר המנה שווה בשווה בין שני המשתמשים (לדוגמה: מנה של 50 ₪ תעלה 25 ₪ לכל אחד).
* אפשרות להגדיר כמות יחידות אם מישהו לקח 2 מתוך 3.



### Flow 4: חישוב טיפ וסיכום (Total & Settlement)

* **Dynamic Calculation Engine:**

$$\text{User Item Total} = \sum \left( \frac{\text{Item Price} \times \text{Quantity}}{\text{Total Participants Sharing Item}} \right)$$


$$\text{User Tip} = \text{User Item Total} \times \left( \frac{\text{Tip \%}}{100} \right)$$


$$\text{User Total} = \text{User Item Total} + \text{User Tip}$$


* **Summary Screen (לכל סועד):**
* פירוט המנות שהשתתף בהן.
* תוספת הטיפ.
* **סכום סופי לתשלום**.


* **Payment Integration Options:**
* כפתור "העתק פירוט ל-WhatsApp" (לדוגמה: "אני חייב לדני 64 ₪ עבור החשבונית במסעדה").
* אפשרות להזנת ה-PayBox / Bit Link של המארח לקפיצה ישירה לאפליקציית התשלום.



---

## 5. מפרט אינטגרציה ל-Gemini API (Cloud Function Spec)

### System Prompt עבור Gemini Flash:

```text
You are an expert OCR and receipt parsing assistant specialized in Israeli restaurant bills in Hebrew.
Analyze the provided image of a restaurant receipt and extract the structured data into JSON format.

Guidelines:
1. Extract item names accurately in Hebrew.
2. Extract quantities and unit prices or total prices per item.
3. Ignore sub-headings that are not distinct chargeable items.
4. Identify if there is a 'service' (שירות) line item and return it separately as serviceFee.
5. Extract the grand total printed on the receipt.

Return JSON strictly matching this schema:
{
  "restaurantName": "string or null",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "price": number
    }
  ],
  "serviceFee": number or 0,
  "rawTotal": number
}

```

---

## 6. דגשי UX/UI ומקרי קצה (UX & Edge Cases)

* **Mobile-First UX:** כפתורים גדולים המותאמים למגע, הזנת שמות מהירה, פונט קריא, ניגודיות גבוהה.
* **Unselected Items Warning:** הציגו אינדיקציה (למשל סרגל אחוזים) המראה כמה אחוזים מהחשבונית שויכו לסועדים, כדי לוודא שאף מנה לא נשכחה.
* **Auto-Cleanup (TTL):** מחיקה אוטומטית של חדרים מ-Firestore לאחר 24 שעות מכללי חיסכון במאגר.
* **Offline / Disconnect Resiliency:** שימוש ב-Firestore Realtime Updates כדי שאם מישהו יתרחק/יסגור את הדפדפן, הבחירות שלו יישמרו והסכום של השאר לא ישתבש.

---

