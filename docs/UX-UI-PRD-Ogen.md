# Ogen (עוגן) — UX/UI Product Requirements & Specifications

| שדה | ערך |
| :--- | :--- |
| **מסמך** | UX/UI PRD & Design Spec |
| **מוצר** | Ogen / עוגן — ניהול בקשות/רעיונות לצוות פיתוח ובקרה |
| **גרסה** | 1.0 (Design Spec) |
| **תאריך** | אוגוסט 2026 |
| **סטטוס** | Ready for UX review / implementation planning |
| **פלטפורמות** | Web (Desktop + Mobile responsive) · Power BI Embed (iframe) |
| **כיוון UI** | RTL (עברית) · Design language: Lamborghini / Lambo |
| **תאימות** | WCAG 2.1 AA |

---

## Project Context (מילוי מהקשר האמיתי)

| פרמטר | הגדרה |
| :--- | :--- |
| **Product Type** | Task / Request Management Application (בקשות/רעיונות + workflow תפעולי) |
| **Target Audience** | צוות פיתוח ובקרה פנימי: יוצרים, מנהלים (Manager), מאסטר (Master), ואורחים |
| **Core Value Proposition** | צינור מרכזי לרישום, תעדוף, דחייה (Inbox), תכנון (Timeline), והשלמה של בקשות/רעיונות — עם שקיפות תפקידית והטמעה ב-Power BI |
| **Target Platforms** | Web SPA · Embed ב-Power BI · מובייל בדפדפן (לא native כרגע) |
| **Personas** | Contributor (יצירה/מעקב) · Manager (משתמשים/קבוצות/מיילים) · Master (טיימליין, לייבלים, ייצוא, ביצוע) · Guest (כניסה מוגבלת) |

> **הערה למומחה UX:** המסמך מגדיר **מצב יעד (target UX)** בהתבסס על המלאי הקיים. במקומות שבהם המוצר הנוכחי שונה מהמלצה — מסומן כ-`[GAP]` או `[EVOLVE]`.

---

# 1. Information Architecture (IA) & User Flows

## 1.1 Site Map & Navigation Architecture

### מודל ניווט ראשי

| משטח | דפוס | רציונל |
| :--- | :--- | :--- |
| **Desktop (≥768px)** | Top Nav (glass) + horizontal `NavTabs` | Fitts: פעולות תכופות קרובות לכותרת; Hick: סינון טאבים לפי תפקיד מצמצם אפשרויות |
| **Mobile (<768px)** | Bottom Nav (Footer) + FAB בולט ל"חדש" | Thumb-zone: יצירה והחלפת מסכים באזור האגודל |
| **Embed (Power BI)** | Compact top `EmbedToolbar` בלבד | צמצום כרום בתוך iframe; ללא Footer / ChatWidget |

**אין Sidebar קבוע בדסקטופ** — מומלץ לשמור Top Nav (לא Collapsible Sidebar) כי מספר היעדים הראשיים ≤ 5 ל-Contributor, ו-Sidebar יוסיף עומס ויזואלי בסגנון Lambo החד.

### היררכיית מסכים

```
Login (/login · /embed/login)
└── App Shell (Protected)
    ├── לוח בקרה / Home (/)
    ├── בקשות/רעיונות (/ideas)
    │   ├── Detail (/ideas/:id)
    │   ├── Edit (/ideas/:id/edit)
    │   ├── New (/ideas/new)
    │   └── Sub-new (/ideas/:parentId/sub/new)
    ├── Inbox (/inbox)
    ├── משימות פתוחות (/insights/open-tasks)
    ├── פרופיל (/profile)
    ├── [Manager+] משתמשים · קבוצות · יומן מיילים
    └── [Master] טיימליין · לייבלים
        └── Overlays גלובליים: GlobalSearch · ChatWidget · ConfirmModal · OfflineBanner
```

### ניווט לפי Persona (Hick's Law)

| Persona | פריטי Nav גלויים (יעד) | עדיפות ברירת מחדל |
| :--- | :--- | :--- |
| Contributor / Guest | לוח בקרה · בקשות · Inbox · משימות פתוחות · פרופיל | Home |
| Manager+ | + משתמשים · קבוצות · יומן מיילים | Home |
| Master | + טיימליין · לייבלים | Home / Timeline לפי תדירות שימוש |

`[EVOLVE]` **Overflow "עוד":** אם מספר טאבים > 6 בדסקטופ — לקבץ פריטי אדמין תחת תפריט "ניהול" כדי לשמור ≤ 5 טאבים ראשיים (Hick).

---

## 1.2 Core User Flow Mapping

### Flow A — Quick Task Creation (יצירה מהירה)

**מטרה:** רישום בקשה/רעיון בזמן מינימלי עם שדות חובה בלבד.

| שלב | Actor | פעולה / טריגר | מערכת | מצב יציאה |
| :---: | :--- | :--- | :--- | :--- |
| 0 | User | Entry: FAB "חדש" / CTA ב-Hero / Nav | פתיחת `/ideas/new` או **Quick Add Sheet** `[EVOLVE]` | Form Default |
| 1 | User | הזנת כותרת (+ אופציונלי: תיאור) | ולידציה חיה על שדות חובה | Invalid → inline error |
| 2 | User | בחירת Priority · Category · Source · Target date | Defaults חכמים (source=mitamim, priority=medium) | — |
| 3 | User `[EVOLVE]` | **Natural language parse** (אופציונלי): `"דחוף מערכות — דוח עד יום ה'"` | Parser ממלא Priority/Category/Date; משתמש מאשר | Parsed preview chips |
| 4 | User | InboxToggle (שלח ל-Inbox?) · Visibility · Labels | שמירת העדפות זמניות בטופס | — |
| 5 | User | Submit | יצירה ב-DB · Toast הצלחה · Navigate ל-Detail או חזרה לרשימה | Success exit |
| E | System | כשל רשת / הרשאה | Callout Error + Retry | Error state · Stay on form |

**Exit states:** Success → Detail | Success → List | Cancel → previous | Error → recoverable form.

> **Matrix:** Quick Add = **Modal / Bottom Sheet** (לא עמוד מלא) ליצירה מהירה; עמוד `/ideas/new` נשאר לטופס מלא / קונטיינר / שדות מתקדמים.

---

### Flow B — Task Organization & Filtering

**מטרה:** מציאת הסט הנכון מתוך רשימה גדולה לפי Priority / Tags(Labels) / Source / Category / Mine / Execution.

| שלב | Actor | פעולה | מערכת | יציאה |
| :---: | :--- | :--- | :--- | :--- |
| 0 | User | Entry: `/ideas` או Global Search `/` | טעינת רשימה + prefs (sort/compact) | Loading → Default |
| 1 | User | חיפוש טקסט / פילטרי sidebar | סינון client/server · עדכון counts ב-Toolbar | Filtered list |
| 2 | User | Sort: date_desc · priority_desc · author_asc | שמירת prefs | Reordered |
| 3 | User | Compact toggle | צפיפות שורות | Compact / Comfortable |
| 4 | User | פתיחת כרטיס | Navigate Detail | Detail |
| 5 | Master | Export | IdeasExportModal עם פילטרים | File download |

**Empty / Edge:** אין תוצאות → EmptyState + CTA ניקוי פילטרים · ≥500 פריטים → virtualization + "מציג N מתוך M".

---

### Flow C — Completion, Deferral, Sub-task Breakdown

| מסלול | Entry | פעולות | יציאה |
| :--- | :--- | :--- | :--- |
| **Completion** | Detail Sidebar / MasterWorkflowActions | שינוי `workflowStatus` → completed · (אופציונלי) מייל השלמה | Detail מעודכן · מופיע ב-Completed accordion |
| **Deferral (Inbox)** | List card / Form InboxToggle / Detail | `pipeline → inbox` · הסרה מלוח פעיל | Inbox list · אפשר Restore |
| **Sub-breakdown** | Detail על Container · CTA "הוסף תת-בקשה" | `/ideas/:parentId/sub/new` · שמירה עם `parentId` | SubIdeasSection מתעדכן |
| **Destructive delete** | Detail | ConfirmModal (Callout-level) · Soft/Hard delete לפי מדיניות | Redirect List |

> **Matrix:** Sub-tasks = **מספרים / רשימה מקוננת** (לא Stepper) — הסדר אינו workflow סדרתי חובה. Stepper שמור רק ל-onboarding או wizard יצירה רב-שלבי אם יתווסף.

---

# 2. Key Screen Specifications & Structural Wireframe Logic

מסכי מפתח (מיפוי למונחי הפרומפט):

| פרומפט | Ogen |
| :--- | :--- |
| Dashboard/Home | `HomePage` `/` |
| Task Detail View | `IdeaDetailPage` `/ideas/:id` |
| Project/Board View | `IdeasListPage` + `TimelinePage` (Master planning board) |
| Quick Add Modal | **Target:** Quick Add Sheet · **Current:** `AddIdeaPage` |

---

## 2.1 Dashboard / Home (`/`)

### Layout & Grid Structure

```
┌─────────────────────────────────────────────────────────┐
│ TOP BAR — Navbar (logo · NavTabs · search · theme · 🔔) │
├─────────────────────────────────────────────────────────┤
│ CANVAS (max-width content, 8pt grid, RTL)               │
│  ┌───────────────────────────────────────────────────┐  │
│  │ A. WelcomeHero (1 job: identity + primary CTA)    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌──────────┬──────────┬────────────────────────────┐  │
│  │ B. Stat  │ C. Stat  │ D. StatusDistribution      │  │ ← Bento ≤ 1 viewport row
│  └──────────┴──────────┴────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ E. OpenTasks snapshot (metrics + 1 insight)       │  │ ← `[EVOLVE]` truncate
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ F. RecentIdeas (table, last 3–5)                  │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│ MOBILE: Bottom Nav · FAB Add                            │
│ GLOBAL: ChatWidget FAB (non-embed)                      │
└─────────────────────────────────────────────────────────┘
```

`[EVOLVE]` **Hero budget:** ב-viewport ראשון — Brand/Welcome + CTA אחד + שורת סטטים אחת בלבד. OpenTasks המלא ו-RecentIdeas מתחת לקיפול.

### Component Mapping Table

| תוכן / פיצ'ר | Component Type | רציונל (Matrix) | Fallback אם לא עומד בסף |
| :--- | :--- | :--- | :--- |
| ברכת משתמש + CTA יצירה | Hero + Primary Button | פעולה ראשית אחת (Fitts) | — |
| ספירת פעילים / Inbox / התפלגות סטטוס | Stat tiles + StatusDistributionCard | ≥2 מטא-שדות מספריים | טקסט בודד |
| Snapshot משימות פתוחות | Interactive Widget (metric tiles + breakdown bars) | נתונים דינמיים + insights | ProgressBar סטטי |
| 3–5 רעיונות אחרונים | **Data Table** (IdeaTableRow) | ≥3 שורות × ≥2 מטא (תאריך, סטטוס/עדיפות) | Card list אם <3 |
| Offline | Callout / OfflineBanner | מצב מערכת קריטי | Toast בלבד — לא מספיק |
| אין רעיונות בכלל | EmptyState + CTA | — | — |

### Micro-interactions

| אינטראקציה | התנהגות |
| :--- | :--- |
| CTA "חדש" | Press → scale 98% · navigate/sheet open |
| Stat tile click | Navigate ל-List עם פילטר pre-applied |
| Recent row click | Navigate Detail |
| Pull-to-refresh (mobile) | רענון IdeasContext |
| Chat FAB | Expand ChatPanel · badge pulse על unread |

### State Management Matrix

| State | UI |
| :--- | :--- |
| **Default** | Hero + stats + snapshot + recent |
| **Loading** | Skeleton ל-bento ול-table (לא splash מלא אחרי כניסה) |
| **Empty** | EmptyState ב-Recent · סטטים = 0 עם CTA יצירה |
| **Error** | Callout בראש ה-Canvas + Retry |
| **Edge (500+ ideas)** | Stats מ-aggregates · Recent נשאר 3–5 · ללא רינדור מלא של הכל |

---

## 2.2 Task Detail View (`/ideas/:id`)

### Layout & Grid Structure

```
┌─────────────────────────────────────────────────────────┐
│ TOP BAR — back · title truncate · share · actions       │
├──────────────────────────────┬──────────────────────────┤
│ MAIN (8–9 cols)              │ SIDEBAR (3–4 cols)       │
│ Meta badges row              │ WorkflowStatusSelect     │
│ Title (H1)                   │ AssigneeSelect           │
│ Description                  │ Dates / Cadence          │
│ Labels · Attachments         │ Visibility               │
│ GoalsTagsEditor              │ MasterWorkflowActions    │
│ SubIdeasSection              │ Complete / Delete        │
│ AuditLog (collapsed default) │                          │
│ IdeaChat (#idea-chat)        │                          │
├──────────────────────────────┴──────────────────────────┤
│ Mobile: Sidebar → bottom sheet / sticky action bar      │
└─────────────────────────────────────────────────────────┘
```

### Component Mapping Table

| תוכן | Component | רציונל | Fallback |
| :--- | :--- | :--- | :--- |
| מטא: priority, source, visibility, execution, inbox | Badge / Chip row | סטטוסים סמנטיים | טקסט משני |
| תיאור ארוך | ExpandableTextarea (read) / Body | — | — |
| קבצים | AttachmentUpload list | — | — |
| תת-בקשות | Nested list + ContainerBadge | לא Stepper (אין סדר חובה) | Numbered list |
| Audit history | Collapsible list / table | ≥3 אירועים עם מטא | Inline muted |
| Chat | ChatPanel scoped | תוכן דינמי | — |
| מחיקה / הרשאה | **ConfirmModal (Callout-level)** | Destructive | Toast — אסור כאופציה יחידה |
| Workflow lifecycle | Status Select בסיידבר | 3 סטטוסים בלבד | **לא Kanban** במסך Detail |
| התקדמות | ProgressBar | ערך יחיד | — |

> **Matrix — Kanban?** לא ב-Detail. Kanban נשקל ב-Board View אם יש צורך ב-DnD בין שלבי lifecycle. כיום 3 סטטוסים (`pending` / `in_progress` / `completed`) → **dropdown מספיק** (Hick).

### Micro-interactions

| Gesture / Action | Behavior |
| :--- | :--- |
| שינוי סטטוס | Optimistic UI · toast · audit append |
| Assign | Combobox multi-select · chip removal |
| Deep link `#idea-chat` | Scroll + highlight live region |
| Share | Web Share / clipboard |
| Mobile swipe-back | Native/history back |

### State Management Matrix

| State | UI |
| :--- | :--- |
| **Default** | Content + Sidebar |
| **Loading** | Page skeleton 2-col |
| **Empty (not found)** | EmptyState + חזרה לרשימה |
| **Error / no permission** | ConfirmModal/Alert + redirect |
| **Edge** | Audit collapsed · Chat virtualized · Attachments cap messaging |

---

## 2.3 Project / Board View

שני משטחי "Board" שונים — אין לערבב:

### A) Ideas List Board (`/ideas`) — Primary work queue

```
┌─────────────────────────────────────────────────────────┐
│ Title + CTA Add │ mobile search                         │
├────────────┬────────────────────────────────────────────┤
│ FILTERS    │ TOOLBAR (sort · compact · counts · export) │
│ Category   ├────────────────────────────────────────────┤
│ Source     │ ACTIVE CARDS / DENSE TABLE                 │
│ Priority   │ …                                          │
│ Mine       ├────────────────────────────────────────────┤
│ Execution  │ COMPLETED (accordion)                      │
└────────────┴────────────────────────────────────────────┘
```

#### Component Mapping

| תוכן | Component | רציונל |
| :--- | :--- | :--- |
| רשימת פעילים עם מטא ≥2 (priority, date, source, status) | **Card list** (ברירת מחדל מובייל) / **Data Table** (compact desktop + bulk) `[EVOLVE]` | Matrix: ≥3 × ≥2 → Table מותר; Cards כשצריך סריקה ויזואלית עשירה |
| פילטרים | Filter Panel (checkbox / chips) | לא Modal לכל פילטר |
| Completed | Accordion list | לא Timeline |
| Export (Master) | Modal עם פילטרים | — |
| אין תוצאות | EmptyState | — |

`[EVOLVE]` **מבט כפול:** Comfortable = cards · Compact = data table עם bulk select.

**Kanban?** אופציונלי רק אם הצוות דורש DnD בין `pending → in_progress → completed`. אחרת נשארים עם List + Status dropdown (פחות עלות קוגניטיבית ל-3 עמודות בלבד).

### B) Timeline Planning Board (`/timeline`) — Master only

```
┌─────────────────────────────────────────────────────────┐
│ Header: week/month toggle · today · filters             │
├──────────┬──────────────────────────────────────────────┤
│ BACKLOG  │ DAY COLUMNS / MONTH GRID                     │
│ unsched. │ TimelineIdeaCard (DnD)                       │
├──────────┴──────────────────────────────────────────────┤
│ FLOATING TICKER — checkCadence items                    │
└─────────────────────────────────────────────────────────┘
```

#### Component Mapping

| תוכן | Component | רציונל | Fallback |
| :--- | :--- | :--- | :--- |
| תכנון לפי תאריכים + overlap ויזואלי | **Timeline** (לא Gantt מלא) | כרונולוגיה ותאריכים = ערך ראשי; אין תלויות משימה מורכבות כיום | Chronological list |
| Backlog לא מתוזמן | Side panel list | — | — |
| Floating checks | Ticker / strip widget | דינמי לפי cadence | Static badge |
| DnD ליום | Draggable cards | — | Date picker בלבד |

> **לא Gantt** כל עוד אין dependencies/milestones חוצי-פרויקט. אם יתווספו תלויות — לשדרג ל-Gantt.

### Micro-interactions (Board)

| | Ideas List | Timeline |
| :--- | :--- | :--- |
| DnD reorder | `[EVOLVE]` אופציונלי | חובה ליום/חודש |
| Swipe (mobile) | Complete / Inbox `[EVOLVE]` | N/A (עמוס מדי) |
| Pull-to-refresh | כן | כן |
| Haptics | Web Vibration API על complete/delete (אם נתמך) | על drop הצלחה |

### State Management Matrix

| State | Ideas List | Timeline |
| :--- | :--- | :--- |
| Default | Filtered active cards/table | Week view + backlog |
| Loading | Skeleton cards / rows | Skeleton columns |
| Empty | EmptyState + Add | Empty day slots + backlog CTA |
| Error | Callout + retry | Callout + retry |
| Edge 500+ | Virtualize · paginate · compact default | חלון זמן מוגבל (שבוע) + lazy month |

---

## 2.4 Quick Add Modal / Sheet `[EVOLVE]`

### Layout

```
┌─────────────────────────────────────┐
│ Grab handle (sheet) · Close         │
│ כותרת: בקשה/רעיון חדש               │
│ [NL input — optional parse]         │
│ Title *                             │
│ Description (collapsed)             │
│ Priority chips · Category · Source  │
│ Date · InboxToggle · Labels         │
│ [שמור] [שמור וחדש] [ביטול]          │
└─────────────────────────────────────┘
```

- **Mobile:** Bottom sheet (thumb-zone CTA)
- **Desktop:** Center modal max-width ~480–560px · focus trap
- **Full page** `/ideas/new` נשאר ל-Container kind / שדות מתקדמים

### Component Mapping

| תוכן | Component | רציונל |
| :--- | :--- | :--- |
| Priority | PriorityChip group | ≤4 אפשרויות — chips > dropdown (Hick + Fitts) |
| Category | CategoryPicker | ≤3 — grid cards |
| NL parse preview | Chip row + Callout קטן אם ambiguous | — |
| שגיאת ולידציה | Inline error (לא Alert מלא) | Alert רק לכשל מערכת |
| הצלחה | Toast | — |

### States

| State | UI |
| :--- | :--- |
| Default | שדות + defaults |
| Loading (submit) | Button disabled + spinner |
| Empty | N/A |
| Error | Inline / Callout רשת |
| Edge | מניעת double-submit · draft localStorage אופציונלי |

---

# 3. Visual Design System & Design Tokens

## 3.1 Visual Style Direction

**כיוון:** Nocturnal Luxury / Lamborghini-inspired operational UI — **Dark Mode High-Contrast** כברירת מחדל, עם Light ו-Dim (warm parchment) כחלופות.

| עקרון | יישום |
| :--- | :--- |
| Atmosphere | משטחי `#000` / charcoal · זהב כ-accent יחיד כמעט |
| Geometry | **Border-radius 0** על כפתורים ו-CTA · זוויות חדות |
| Elevation | ללא צללים דקורטיביים (flat) — היררכיה ב-surface steps |
| Motion | 2–3 תנועות מכוונות (nav scroll glass, FAB, status change) — לא רעש |
| Density | Desktop operational-dense · Mobile comfortable |
| Brand | AppLogo + Gold CTA כסיגנל ראשי |

**אין:** gradients דקורטיביים על טקסט · glow מוגזם · rounded-full pills כברירת מחדל · כרטיסים ב-hero.

---

## 3.2 Typography Scale

**משפחות:** `Roboto Condensed` / `Roboto` / `Heebo` (עברית) — קרוב ל-LamboType discipline (condensed neo-grotesk).

| Role | Size | Weight | Line-height | שימוש |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 32–40px | 400–500 | 1.1–1.2 | Hero welcome (לא צועק מעל הלוגו) |
| **H1** | 24–28px | 500 | 1.2 | כותרת Detail / Page |
| **H2** | 20px | 500 | 1.25 | Section titles |
| **H3 / Sub** | 16–18px | 500 | 1.35 | Card titles · Sidebar headers |
| **Body** | 14–16px | 400 | 1.5 | תיאורים · צ'אט |
| **UI / Label** | 12–13px | 500–600 | 1.3 | Badges · Nav · Table headers (uppercase אופציונלי EN) |
| **Micro** | 10–11px | 400–500 | 1.2 | Timestamps · meta |

**RTL:** Heebo לגוף עברי · שמירת יחס ניגודיות על זהב/שחור.

---

## 3.3 Semantic Color Palette

### Surfaces & Text (Dark default)

| Token | Hex (approx) | תפקיד |
| :--- | :--- | :--- |
| `background` | `#000000` | Canvas |
| `surface` | `#000000` | Base |
| `surface-container` | `#202020` | Cards / panels |
| `surface-container-low` | `#181818` | Secondary panels |
| `surface-container-lowest` | `#202020` / `#323232` | Inputs / elevated |
| `on-surface` | `#FFFFFF` | Primary text |
| `on-surface-variant` | `#7D7D7D` | Secondary / meta |
| `border-light` | `#313131` / ash | Dividers |
| `primary` (Gold) | `#FFC000` | Primary CTA only |
| `primary-deep` | `#917300` | Hover/pressed |
| `accent` (Cyan) | `#29ABE2` | Info / interactive highlight |
| `error` | `#CF202F` | Errors / destructive |
| `success` | `#05B169` | Completion positive |

### Priority (מיפוי Ogen: 3 רמות קיימות + המלצת הרחבה)

| Level | Token | Color guidance | שימוש |
| :--- | :--- | :--- | :--- |
| **P1 Urgent** `[EVOLVE]` | `priority-p1` | Error red / high-chroma | קריטי — אופציונלי מעל high |
| **P2 High** | `priority-high` | Gold / warm alert | `high` הקיים |
| **P3 Medium** | `priority-medium` | Cyan / neutral accent | `medium` |
| **P4 Low** | `priority-low` | Ash / muted | `low` |

> כיום במערכת: `low | medium | high` בלבד. P1 כרמה רביעית = החלטת מוצר; עד אז map: high→P2, medium→P3, low→P4.

### Workflow Status

| Status | Tone | UI |
| :--- | :--- | :--- |
| `pending` | Neutral / warning soft | Badge |
| `in_progress` | Accent cyan | Badge + Progress |
| `completed` | Success | Badge · move to completed bucket |

### Contrast pairings (WCAG AA)

| Foreground | Background | Min ratio |
| :--- | :--- | :--- |
| White text | `#000` / `#202020` | ≥4.5:1 (body) · ≥3:1 (large) |
| Gold `#FFC000` on Black | CTA | ודא טקסט על Gold = `#000` |
| Gold text on Black | accents only | לא לגוף ארוך |
| Error on dark | `#CF202F` על `#000` | אייקון+טקסט, לא טקסט דק בלבד |

---

## 3.4 Spacing & Elevation Rules

### 8pt Spacing Grid

| Token | Value | שימוש |
| :--- | :--- | :--- |
| `space-1` | 4px | אייקון-טקסט צמוד |
| `space-2` | 8px | Chip gap · compact |
| `space-3` | 16px | Component padding |
| `space-4` | 24px | Section padding |
| `space-5` | 32px | Layout gutters |
| `space-6` | 48px | Section breaks |
| `space-7` | 64px | Page top under fixed nav |

### Radius

| Element | Radius |
| :--- | :--- |
| Buttons / CTA / inputs (Lambo) | **0px** |
| Cards / panels | 0–2px (עדיפות 0) |
| Avatars | full circle (יוצא דופן פונקציונלי) |
| Modals | 0px |

### Elevation

| Tier | Treatment |
| :--- | :--- |
| 0 Base | Flat black |
| 1 Raised surface | `#181818` / `#202020` fill · 1px border |
| 2 Overlay (modal/sheet) | Scrim `rgba(0,0,0,0.7)` · panel container |
| 3 Nav | Glass / border-bottom · **no drop shadow** |

---

# 4. Accessibility (A11y) & Ergonomics

## 4.1 Compliance Target

- **WCAG 2.1 Level AA**
- מקלדת מלאה לכל פעולה (יצירה, פילטר, DnD אלטרנטיבי בטיימליין)
- `prefers-reduced-motion`: כיבוי אנימציות לא-חיוניות
- תמיכה ב-Zoom 200% ללא אובדן פונקציה

## 4.2 Tap Targets & Touch

| אלמנט | מינימום |
| :--- | :--- |
| כפתורים, Nav items, Chips לחיצים | **≥ 48×48 dp/pt** |
| Row hit area בטבלה/רשימה | ≥ 48px גובה |
| Spacing בין מטרות סמוכות | ≥ 8px |

## 4.3 Thumb-zone (Mobile)

| אזור | תוכן מומלץ |
| :--- | :--- |
| **Easy (תחתון)** | Bottom Nav · FAB Add · Sheet primary CTA · Chat FAB |
| **Stretch (אמצע)** | תוכן רשימה · קריאה |
| **Hard (עליון)** | Secondary actions · Theme · Profile — לא CTAs ראשיים |

Detail במובייל: **Sticky action bar** תחתונה ל-Complete / Status (לא רק סיידבר עליון).

## 4.4 Screen Reader & ARIA

| משטח | דרישה |
| :--- | :--- |
| Nav | `nav` · `aria-current="page"` על טאב פעיל |
| Live updates (יצירת משימה, צ'אט חדש, offline) | `aria-live="polite"` (assertive לשגיאות קריטיות) |
| Modals | `role="dialog"` · `aria-modal` · focus trap · Escape |
| Confirm destructive | `role="alertdialog"` |
| Status badges | טקסט נגיש לא רק צבע (`aria-label` / sr-only) |
| Timeline DnD | אלטרנטיבה: תפריט "העבר לתאריך" · הודעות live על drop |
| Charts (Open Tasks) | טבלה נסתרת / summary טקסטואלי |
| RTL | `dir="rtl"` ברמת מסמך · לוגיקה פיזית לאייקונים כיווניים |

## 4.5 Forms & Errors

- Labels גלויים (לא placeholder-as-label)
- שגיאות מקושרות ב-`aria-describedby`
- לא להסתמך על צבע בלבד ל-Priority/Status

---

# 5. Structured Documentation Output — Decision Log & Export Pack

## 5.1 Content-to-Component Decision Log (סיכום מחייבי)

| מסך / פיצ'ר | נבחר | לא נבחר | סיבה |
| :--- | :--- | :--- | :--- |
| Recent ideas (Home) | Data Table | Cards | ≥3 × ≥2 metadata |
| Ideas queue (mobile) | Card list | Table | סריקה + touch |
| Ideas queue (desktop compact) | Data Table `[EVOLVE]` | Cards only | sorting/bulk |
| Workflow 3-states | Status dropdown | Kanban | Hick — מעט שלבים |
| Timeline planning | Timeline board | Gantt | אין dependencies |
| Sub-ideas | Nested list | Stepper | אין סדר חובה |
| Delete / permission | ConfirmModal (Callout) | Toast only | Destructive |
| Open tasks analytics | Interactive widgets | Static text | נתונים דינמיים |
| Quick create | Modal/Sheet `[EVOLVE]` | תמיד full page | מהירות רישום |
| Overdue / offline | Callout / Banner | Muted inline | Critical |

## 5.2 Priority Gaps for UX Workshop

| ID | נושא | Impact | Effort | סטטוס |
| :--- | :--- | :--- | :--- | :--- |
| G1 | Quick Add Sheet + defaults חכמים | גבוה | בינוני | **בוצע** — Sheet מכל CTA / FAB / מקש `n` · `/ideas/new` לטופס מלא |
| G2 | Home hero budget (צמצום above-the-fold) | גבוה | נמוך | **בוצע** — Hero מצומצם + OpenTasks snapshot |
| G3 | Detail mobile sticky actions | גבוה | בינוני | **בוצע** — `IdeaDetailMobileActions` |
| G4 | List Comfortable/Compact = Cards/Table | בינוני | בינוני | **בוצע** — Compact = `IdeasCompactTable` |
| G5 | Nav overflow "ניהול" | בינוני | נמוך | **בוצע** — תפריט ניהול + footer מצומצם |
| G6 | NL parse ב-Quick Add | נמוך–בינוני | גבוה | ממתין |
| G7 | P1 priority level | נמוך | נמוך | ממתין |
| G8 | Kanban board | נמוך (רק אם יידרש DnD סטטוס) | גבוה | לא default |

### בוצע גם (סבב UX נוסף)
- לוגיקת איחור: הושלם לא מסומן כבאיחור · KPI "לטיפול עכשיו" · תובנות רגועות יותר
- Detail: badges ראשיים + "עוד" · צ'אט/audit מכווצים במובייל
- פילטרים נשמרים ב-localStorage + "נקה הכל"
- Quick Add: מקור+לייבלים תחת "עוד אפשרויות"

## 5.3 Wireframe ASCII Pack (ייצוא מהיר ל-Notion)

העתק את הבלוקים בסעיפים 2.1–2.4 לתוך Notion/Confluence כ-code blocks.  
הטבלאות במסמך זה מיוצאות כ-Markdown tables ללא תלות בעיצוב.

## 5.4 Definition of Done (Design Spec)

- [ ] IA וניווט לפי persona אושרו
- [ ] 4 מסכי מפתח עברו review מול Selection Matrix
- [ ] טוקנים (צבע, טיפוגרפיה, 8pt, radius 0) מיושרים ל-Lambo הקיים
- [ ] מצבי Default/Loading/Empty/Error/Edge הוגדרו לכל מסך מפתח
- [ ] A11y AA + 48px targets + RTL נבדקו ברשימת קבלה
- [ ] רשימת Gaps (G1–G8) תועדפה עם בעל מוצר

---

## Appendix A — Glossary (מונחי מוצר)

| עברית | English / Code |
| :--- | :--- |
| בקשה/רעיון | Idea / Request |
| Inbox | Maybe-later pipeline |
| קונטיינר | `ideaKind: container` |
| תת-בקשה | Sub-idea (`parentId`) |
| נשלח לביצוע | `sentToExecution` |
| בדיקה שוטפת | `checkCadence` |
| מאסטר / מנהל | Master / Manager roles |

## Appendix B — Related Artifacts

- UI inventory canvas: מלאי מסכים וקומפוננטות (שיחה קודמת)
- `DESIGN-lamborghini.md` — מקור השראה ויזואלי
- `src/index.css` — טוקנים חיים (light / dim / dark)
- `src/types/idea.ts` — מודל נתונים וסטטוסים

---

*מסמך זה הוא Design Spec בלבד — ללא מימוש קוד. לשימוש ב-Notion / Obsidian / Confluence ובייעוץ מומחה UI/UX.*
