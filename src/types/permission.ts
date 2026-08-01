import type { AppNavItemId } from '../config/appNavigation'

export const PERMISSIONS_STORAGE_KEY = 'ogen-permission-rules-v1'

export type PermissionMode = 'default' | 'groups' | 'disabled'

/** מפתחות הרשאה — פעולות ותצוגות */
export type PermissionKey =
  | 'page.home'
  | 'page.ideas'
  | 'page.inbox'
  | 'page.openTasks'
  | 'page.timeline'
  | 'page.labels'
  | 'page.groups'
  | 'page.emailLog'
  | 'page.users'
  | 'page.profile'
  | 'page.addIdea'
  | 'page.permissions'
  | 'page.boards'
  | 'action.complete_idea'
  | 'action.edit_idea'
  | 'action.delete_idea'
  | 'action.create_idea'
  | 'action.create_sub_idea'
  | 'action.manage_execution'
  | 'action.schedule_timeline'
  | 'action.export_ideas'
  | 'action.manage_labels'
  | 'action.manage_users'
  | 'action.manage_groups'

export type PermissionKind = 'page' | 'action'

export interface PermissionRule {
  key: PermissionKey
  mode: PermissionMode
  groupIds: string[]
  updatedAt?: string
  updatedByUserId?: string
}

export interface PermissionCatalogItem {
  key: PermissionKey
  kind: PermissionKind
  label: string
  description: string
  /** קישור לניווט (לתצוגות) */
  navId?: AppNavItemId
}

export const PERMISSION_MODE_LABELS: Record<PermissionMode, string> = {
  default: 'ברירת מחדל (לפי תפקיד)',
  groups: 'רק קבוצות נבחרות',
  disabled: 'חסום לכולם (חוץ ממאסטר)',
}

export const PERMISSION_CATALOG: PermissionCatalogItem[] = [
  {
    key: 'page.home',
    kind: 'page',
    label: 'לוח בקרה',
    description: 'גישה לדף הבית / לוח הבקרה',
    navId: 'home',
  },
  {
    key: 'page.ideas',
    kind: 'page',
    label: 'בקשות/רעיונות',
    description: 'רשימת הבקשות והרעיונות',
    navId: 'ideas',
  },
  {
    key: 'page.inbox',
    kind: 'page',
    label: 'Inbox',
    description: 'תיבת בקשות לבחינה עתידית',
    navId: 'inbox',
  },
  {
    key: 'page.openTasks',
    kind: 'page',
    label: 'משימות פתוחות',
    description: 'דשבורד משימות שלא נסגרו',
    navId: 'openTasks',
  },
  {
    key: 'page.timeline',
    kind: 'page',
    label: 'טיימליין',
    description: 'תכנון לוחות זמנים (ברירת מחדל: מאסטר)',
    navId: 'timeline',
  },
  {
    key: 'page.labels',
    kind: 'page',
    label: 'לייבלים',
    description: 'ניהול לייבלים (ברירת מחדל: מאסטר)',
    navId: 'labels',
  },
  {
    key: 'page.groups',
    kind: 'page',
    label: 'קבוצות',
    description: 'ניהול קבוצות (ברירת מחדל: מנהל/מאסטר)',
    navId: 'groups',
  },
  {
    key: 'page.emailLog',
    kind: 'page',
    label: 'יומן מיילים',
    description: 'יומן שליחות (ברירת מחדל: מנהל/מאסטר)',
    navId: 'emailLog',
  },
  {
    key: 'page.users',
    kind: 'page',
    label: 'משתמשים',
    description: 'ניהול משתמשים (ברירת מחדל: מנהל/מאסטר)',
    navId: 'users',
  },
  {
    key: 'page.profile',
    kind: 'page',
    label: 'פרופיל',
    description: 'דף הפרופיל האישי',
    navId: 'profile',
  },
  {
    key: 'page.addIdea',
    kind: 'page',
    label: 'הוספת בקשה',
    description: 'יצירת בקשה/רעיון חדש (עמוד מלא / Quick Add)',
  },
  {
    key: 'page.permissions',
    kind: 'page',
    label: 'הרשאות מערכת',
    description: 'מסך ניהול ההרשאות — תמיד למאסטר בלבד',
  },
  {
    key: 'page.boards',
    kind: 'page',
    label: 'לוחות מקושרים',
    description: 'גישה ללוחות Notion / Power BI ואתרים חיצוניים',
    navId: 'boards',
  },
  {
    key: 'action.complete_idea',
    kind: 'action',
    label: 'סגירת בקשה (סימון הושלם)',
    description: 'מי רשאי לסמן בקשה כהושלם',
  },
  {
    key: 'action.edit_idea',
    kind: 'action',
    label: 'עריכת בקשה',
    description: 'מי רשאי לערוך פרטי בקשה קיימת',
  },
  {
    key: 'action.delete_idea',
    kind: 'action',
    label: 'מחיקת בקשה',
    description: 'מי רשאי למחוק בקשה',
  },
  {
    key: 'action.create_idea',
    kind: 'action',
    label: 'יצירת בקשה',
    description: 'מי רשאי לפתוח בקשה חדשה',
  },
  {
    key: 'action.create_sub_idea',
    kind: 'action',
    label: 'יצירת תת-בקשה',
    description: 'מי רשאי להוסיף תת-בקשה תחת מארז',
  },
  {
    key: 'action.manage_execution',
    kind: 'action',
    label: 'ניהול ביצוע / בדיקות',
    description: 'תיוג לביצוע ובדיקות שוטפות (ברירת מחדל: מאסטר)',
  },
  {
    key: 'action.schedule_timeline',
    kind: 'action',
    label: 'תזמון בטיימליין',
    description: 'שיבוץ תאריכים בטיימליין (ברירת מחדל: מאסטר)',
  },
  {
    key: 'action.export_ideas',
    kind: 'action',
    label: 'ייצוא לאקסל',
    description: 'ייצוא רשימת בקשות (ברירת מחדל: מאסטר)',
  },
  {
    key: 'action.manage_labels',
    kind: 'action',
    label: 'ניהול לייבלים',
    description: 'יצירה ועריכת לייבלים (ברירת מחדל: מאסטר)',
  },
  {
    key: 'action.manage_users',
    kind: 'action',
    label: 'ניהול משתמשים',
    description: 'יצירה ועריכת משתמשים (ברירת מחדל: מנהל/מאסטר)',
  },
  {
    key: 'action.manage_groups',
    kind: 'action',
    label: 'ניהול קבוצות',
    description: 'יצירה ועריכת קבוצות (ברירת מחדל: מנהל/מאסטר)',
  },
]

export function defaultRule(key: PermissionKey): PermissionRule {
  return { key, mode: 'default', groupIds: [] }
}

export function rulesMap(rules: PermissionRule[]): Map<PermissionKey, PermissionRule> {
  const map = new Map<PermissionKey, PermissionRule>()
  for (const item of PERMISSION_CATALOG) {
    map.set(item.key, defaultRule(item.key))
  }
  for (const rule of rules) {
    map.set(rule.key, {
      key: rule.key,
      mode: rule.mode,
      groupIds: [...(rule.groupIds ?? [])],
      updatedAt: rule.updatedAt,
      updatedByUserId: rule.updatedByUserId,
    })
  }
  return map
}
