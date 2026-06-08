/** מנרמל מספר ישראלי ל-E.164 ללא + (972501234567) */
export function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('972')) return digits
  if (digits.startsWith('0')) return `972${digits.slice(1)}`
  if (digits.length >= 9) return `972${digits}`
  return digits
}

export function formatPhoneDisplay(e164: string): string {
  if (!e164) return ''
  if (e164.startsWith('972') && e164.length >= 12) {
    return `0${e164.slice(3)}`
  }
  return e164
}

export function isValidIsraeliPhone(raw: string): boolean {
  const n = normalizePhoneE164(raw)
  return /^9725\d{8}$/.test(n) || /^972[23489]\d{7,8}$/.test(n)
}
