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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = Deno.env.get('EMAIL_FROM')
    const appPublicUrl = Deno.env.get('APP_PUBLIC_URL') ?? ''

    if (!resendKey || !emailFrom) {
      return new Response(
        JSON.stringify({ ok: false, skipped: true, reason: 'email_not_configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

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
        'id, title, description, workflow_status, visibility, assignee_user_id, created_by_user_id',
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
    const assigneeId = idea.assignee_user_id as string | null

    const canNotify =
      actor &&
      (actor.id === creatorId ||
        actor.id === assigneeId ||
        actor.access_level === 'manager' ||
        actor.access_level === 'master')

    if (!canNotify) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const visibility = (idea.visibility as string) || 'team'

    const { data: activeUsers, error: usersErr } = await admin
      .from('app_users')
      .select('id, name, email, active, access_level')
      .eq('active', true)
      .in('access_level', ['manager', 'member', 'master'])

    if (usersErr) {
      return new Response(JSON.stringify({ error: 'users_load_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let eligible = activeUsers ?? []
    if (visibility === 'master_private') {
      eligible = eligible.filter((u) => u.id === creatorId)
    } else if (visibility === 'managers_only') {
      eligible = eligible.filter(
        (u) => u.access_level === 'manager' || u.access_level === 'master',
      )
    }

    const recipients: RecipientRole[] = eligible.map((u) => {
      let role: RecipientRole['role'] = 'team'
      if (u.id === creatorId) role = 'creator'
      else if (u.id === assigneeId) role = 'assignee'
      return { userId: u.id as string, role }
    })

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ ok: false, skipped: true, reason: 'no_recipients' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const recipientIds = recipients.map((r) => r.userId)
    const { data: prefsRows } = await admin
      .from('user_preferences')
      .select('user_id, notify_email_completed')
      .in('user_id', recipientIds)

    const prefsByUser = new Map(
      (prefsRows ?? []).map((p) => [p.user_id as string, p.notify_email_completed]),
    )
    const usersById = new Map(eligible.map((u) => [u.id as string, u]))

    const title = (idea.title as string) || 'בקשה/רעיון'
    const description = (idea.description as string) || ''
    const actorName = (actor?.name as string) || 'משתמש'
    const ideaUrl = appPublicUrl
      ? `${appPublicUrl.replace(/\/$/, '')}/ideas/${ideaId}`
      : null

    const sent: { email: string; role: string; id?: string }[] = []
    const skipped: { userId: string; reason: string }[] = []
    const failed: { email: string; error: unknown }[] = []

    for (const { userId, role } of recipients) {
      const user = usersById.get(userId)
      if (!user?.active) {
        skipped.push({ userId, reason: 'inactive' })
        continue
      }

      const email = (user.email as string)?.trim()
      if (!email) {
        skipped.push({ userId, reason: 'no_email' })
        continue
      }

      const notifyPref = prefsByUser.get(userId)
      if (notifyPref === false) {
        skipped.push({ userId, reason: 'prefs_off' })
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

      const result = await sendResendEmail(resendKey, emailFrom, email, subject, html)
      if (result.ok) {
        sent.push({ email, role, id: result.id })
      } else {
        failed.push({ email, error: result.error })
      }
    }

    if (sent.length === 0 && failed.length > 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'email_send_failed', failed, skipped }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ ok: true, sent, skipped, failed: failed.length ? failed : undefined }),
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
