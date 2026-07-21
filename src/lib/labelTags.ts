/** מזהי לייבלים נשמרים ב-tags עם prefix lbl- */
export function isLabelTag(tag: string): boolean {
  return tag.startsWith('lbl-')
}

export function extractLabelIds(tags: string[] | undefined): string[] {
  return (tags ?? []).filter(isLabelTag)
}

/** שומר תגים שאינם לייבלים (למשל סימון מארז) ומחליף רק את הלייבלים */
export function mergeLabelIdsIntoTags(
  existingTags: string[] | undefined,
  labelIds: string[],
): string[] {
  const other = (existingTags ?? []).filter((t) => !isLabelTag(t))
  const uniqueLabels = [...new Set(labelIds)]
  return [...other, ...uniqueLabels]
}
