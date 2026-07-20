import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface NotifyRequest {
  ideaId: string
  actorUserId: string
}

interface RecipientRole {
  userId: string
  role: 'creator' | 'assignee' | 'team'
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function roleIntro(role: RecipientRole['role'], name: string): string {
  if (role === 'creator') {
    return `שלום ${name},<br><br>הבקשה/רעיון שפתחת סומן/ה כ<strong>הושלם</strong>.`
  }
  if (role === 'assignee') {
    return `שלום ${name},<br><br>הבקשה/רעיון שהוקצה לך סומן/ה כ<strong>הושלם</strong>.`
  }
  return `שלום ${name},<br><br>בקשה/רעיון במערכת Ogen סומן/ה כ<strong>הושלם</strong>.`
}

function buildEmailHtml(params: {
  recipientName: string
  role: RecipientRole['role']
  title: string
  description: string
  actorName: string
  ideaUrl: string | null
}): string {
  const { recipientName, role, title, description, actorName, ideaUrl } = params
  const desc = description
    ? `<p style="margin:16px 0;color:#444;line-height:1.6;">${escapeHtml(truncate(description, 1200))}</p>`
    : ''

  const link = ideaUrl
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(ideaUrl)}" style="color:#1a5f4a;font-weight:600;">צפייה בבקשה/רעיון באפליקציה</a></p>`
    : ''

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"></head>
<body style="font-family:Segoe UI,Arial,sans-serif;background:#f5f5f0;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e8e8e0;">
    <p style="margin:0 0 8px;font-size:13px;color:#888;">Ogen — צוות פיתוח ובקרה</p>
    <h1 style="margin:0 0 20px;font-size:22px;color:#1a1a1a;">✅ בקשה/רעיון הושלם</h1>
    <p style="margin:0 0 20px;line-height:1.6;color:#333;">${roleIntro(role, escapeHtml(recipientName))}</p>
    <h2 style="margin:0 0 8px;font-size:18px;color:#1a5f4a;">${escapeHtml(truncate(title, 200))}</h2>
    ${desc}
    <p style="margin:16px 0 0;font-size:14px;color:#666;">סומן כהושלם על ידי: <strong>${escapeHtml(actorName)}</strong></p>
    ${link}
    <hr style="margin:28px 0;border:none;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#999;">הודעה אוטומטית ממערכת Ogen</p>
  </div>
</body>
</html>`
}

async function sendResendEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; id?: string; error?: unknown }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Resend error', json)
    return { ok: false, error: json }
  }
  return { ok: true, id: json.id }
}

function newLogId(): string {
  return `eml-${crypto.randomUUID()}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = Deno.env.get('EMAIL_FROM')
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') ?? ''
    const emailConfigured = !!(resendKey && emailFrom)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, serviceKey)

    const { ideaId, actorUserId } = (await req.json()) as NotifyRequest
    if (!ideaId || !actorUserId) {
      return new Response(JSON.stringify({ error: 'ideaId and actorUserId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: idea, error: ideaErr } = await admin
      .from('ideas')
      .select(
        'id, title, description, workflow_status, visibility, assignee_user_id, assignee_user_ids, assignee_group_ids, created_by_user_id',
      )
      .eq('id', ideaId)
      .maybeSingle()

    if (ideaErr || !idea) {
      return new Response(JSON.stringify({ error: 'idea_not_found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (idea.workflow_status !== 'completed') {
      return new Response(JSON.stringify({ ok: false, skipped: true, reason: 'not_completed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: actor } = await admin
      .from('app_users')
      .select('id, name, access_level')
      .eq('id', actorUserId)
      .maybeSingle()

    const creatorId = idea.created_by_user_id as string | null
    const assigneeUserIds = Array.from(
      new Set(
        [
          ...(Array.isArray(idea.assignee_user_ids) ? (idea.assignee_user_ids as string[]) : []),
          idea.assignee_user_id as string | null,
        ].filter((id): id is string => !!id),
      ),
    )
    const assigneeGroupIds = Array.isArray(idea.assignee_group_ids)
      ? (idea.assignee_group_ids as string[])
      : []

    let groupMemberIds: string[] = []
    if (assigneeGroupIds.length > 0) {
      const { data: members } = await admin
        .from('app_group_members')
        .select('user_id')
        .in('group_id', assigneeGroupIds)
      groupMemberIds = (members ?? []).map((m) => m.user_id as string)
    }

    const assignedUserIds = Array.from(new Set([...assigneeUserIds, ...groupMemberIds]))

    const canNotify =
      actor &&
      (actor.id === creatorId ||
        assignedUserIds.includes(actor.id as string) ||
        actor.access_level === 'manager' ||
        actor.access_level === 'master')

    if (!canNotify) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const actorName = (actor?.name as string) || 'משתמש'
    const ideaTitle = (idea.title as string) || 'בקשה/רעיון'

    const sent: { email: string; role: string; id?: string; userId?: string }[] = []
    const skipped: { userId: string; reason: string }[] = []
    const failed: { email: string; error: unknown }[] = []
    const logRows: Record<string, unknown>[] = []

    const pushLog = (row: {
      recipientUserId?: string
      recipientEmail: string
      recipientName?: string
      role?: string
      status: 'sent' | 'skipped' | 'failed'
      reason?: string
      providerId?: string
    }) => {
      logRows.push({
        id: newLogId(),
        idea_id: ideaId,
        actor_user_id: actorUserId,
        actor_name: actorName,
        recipient_user_id: row.recipientUserId ?? null,
        recipient_email: row.recipientEmail,
        recipient_name: row.recipientName ?? null,
        role: row.role ?? null,
        status: row.status,
        reason: row.reason ?? null,
        provider_id: row.providerId ?? null,
        idea_title: ideaTitle,
      })
    }

    if (!emailConfigured) {
      skipped.push({ userId: '_email', reason: 'email_not_configured' })
      pushLog({
        recipientEmail: '-',
        status: 'skipped',
        reason: 'email_not_configured',
      })
    } else {
      // Recipients = all assignees (users + group members). Creator included if assigned or as creator role.
      const recipientIds = Array.from(
        new Set([
          ...assignedUserIds,
          ...(creatorId ? [creatorId] : []),
        ]),
      )

      const { data: exclusions } = await admin
        .from('email_completion_exclusions')
        .select('subject_type, subject_id')

      const excludedUserIds = new Set(
        (exclusions ?? [])
          .filter((e) => e.subject_type === 'user')
          .map((e) => e.subject_id as string),
      )
      const excludedGroupIds = new Set(
        (exclusions ?? [])
          .filter((e) => e.subject_type === 'group')
          .map((e) => e.subject_id as string),
      )

      let excludedViaGroup = new Set<string>()
      if (excludedGroupIds.size > 0) {
        const { data: exMembers } = await admin
          .from('app_group_members')
          .select('user_id')
          .in('group_id', Array.from(excludedGroupIds))
        excludedViaGroup = new Set((exMembers ?? []).map((m) => m.user_id as string))
      }

      if (recipientIds.length === 0) {
        skipped.push({ userId: '_email', reason: 'no_recipients' })
        pushLog({
          recipientEmail: '-',
          status: 'skipped',
          reason: 'no_recipients',
        })
      } else {
        const { data: users, error: usersErr } = await admin
          .from('app_users')
          .select('id, name, email, active, access_level')
          .in('id', recipientIds)

        if (usersErr) {
          return new Response(JSON.stringify({ error: 'users_load_failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        const { data: prefsRows } = await admin
          .from('user_preferences')
          .select('user_id, notify_email_completed')
          .in('user_id', recipientIds)

        const prefsByUser = new Map(
          (prefsRows ?? []).map((p) => [p.user_id as string, p.notify_email_completed]),
        )

        const title = ideaTitle
        const description = (idea.description as string) || ''
        const ideaUrl = appPublicUrl
          ? `${appPublicUrl.replace(/\/$/, '')}/ideas/${ideaId}`
          : null

        for (const user of users ?? []) {
          const userId = user.id as string
          let role: RecipientRole['role'] = 'team'
          if (userId === creatorId) role = 'creator'
          else if (assignedUserIds.includes(userId)) role = 'assignee'

          if (!user.active) {
            skipped.push({ userId, reason: 'inactive' })
            pushLog({
              recipientUserId: userId,
              recipientEmail: (user.email as string) || '-',
              recipientName: user.name as string,
              role,
              status: 'skipped',
              reason: 'inactive',
            })
            continue
          }

          if (excludedUserIds.has(userId) || excludedViaGroup.has(userId)) {
            skipped.push({ userId, reason: 'excluded' })
            pushLog({
              recipientUserId: userId,
              recipientEmail: (user.email as string) || '-',
              recipientName: user.name as string,
              role,
              status: 'skipped',
              reason: 'excluded',
            })
            continue
          }

          const email = (user.email as string)?.trim()
          if (!email) {
            skipped.push({ userId, reason: 'no_email' })
            pushLog({
              recipientUserId: userId,
              recipientEmail: '-',
              recipientName: user.name as string,
              role,
              status: 'skipped',
              reason: 'no_email',
            })
            continue
          }

          const notifyPref = prefsByUser.get(userId)
          if (notifyPref === false) {
            skipped.push({ userId, reason: 'prefs_off' })
            pushLog({
              recipientUserId: userId,
              recipientEmail: email,
              recipientName: user.name as string,
              role,
              status: 'skipped',
              reason: 'prefs_off',
            })
            continue
          }

          const recipientName = (user.name as string) || 'משתמש'
          const subject = `✅ הושלם: ${truncate(title, 80)} — Ogen`
          const html = buildEmailHtml({
            recipientName,
            role,
            title,
            description,
            actorName,
            ideaUrl,
          })

          const result = await sendResendEmail(resendKey!, emailFrom!, email, subject, html)
          if (result.ok) {
            sent.push({ email, role, id: result.id, userId })
            pushLog({
              recipientUserId: userId,
              recipientEmail: email,
              recipientName,
              role,
              status: 'sent',
              providerId: result.id,
            })
          } else {
            failed.push({ email, error: result.error })
            pushLog({
              recipientUserId: userId,
              recipientEmail: email,
              recipientName,
              role,
              status: 'failed',
              reason: 'email_send_failed',
            })
          }
        }
      }
    }

    if (logRows.length > 0) {
      const { error: logErr } = await admin.from('email_send_log').insert(logRows)
      if (logErr) console.error('email_send_log insert failed', logErr)
    }

    if (emailConfigured && sent.length === 0 && failed.length > 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'email_send_failed',
          sent,
          failed,
          skipped,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        ok: sent.length > 0 || (!emailConfigured && skipped.length > 0),
        sent,
        skipped,
        failed: failed.length ? failed : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
