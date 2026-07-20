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

function roleBody(role: RecipientRole['role']): string {
  if (role === 'creator') {
    return 'הבקשה/רעיון שפתחת סומן/ה כהושלם.'
  }
  if (role === 'assignee') {
    return 'הבקשה/רעיון שהוקצה לך סומן/ה כהושלם.'
  }
  return 'בקשה/רעיון במערכת Ogen סומן/ה כהושלם.'
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
  const safeName = escapeHtml(recipientName)
  const safeTitle = escapeHtml(truncate(title, 200))
  const safeActor = escapeHtml(actorName)
  const safeBody = escapeHtml(roleBody(role))
  const safeDesc = description
    ? `<p style="margin:12px 0 0;font-family:'Work Sans',Arial,sans-serif;font-size:15px;line-height:1.5;color:#778aac;">${escapeHtml(truncate(description, 400))}</p>`
    : ''
  const ctaHref = ideaUrl || 'https://idea-teams-app.vercel.app/'
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Ogen - עדכון סטטוס</title>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&amp;family=Work+Sans:wght@400;500&amp;family=JetBrains+Mono:wght@500&amp;display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#fbf9fc;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fbf9fc;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background-color:#000b20;padding:24px 28px;border-radius:12px 12px 0 0;border-bottom:2px solid #fdc003;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="right">
                  <h1 style="margin:0;font-family:Rubik,Arial,sans-serif;font-size:24px;line-height:1.3;font-weight:600;color:#fdc003;">Ogen</h1>
                  <p style="margin:4px 0 0;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.05em;color:#ffffff;opacity:0.8;">צוות פיתוח ובקרה</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Main card -->
        <tr>
          <td style="background-color:#ffffff;border-radius:0 0 12px 12px;border-top:4px solid #009e52;overflow:hidden;">
            <!-- Status hero -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f3f6;border-bottom:1px solid #c4c6ce;">
              <tr>
                <td align="center" style="padding:28px 24px;">
                  <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:9999px;background-color:#002810;color:#009e52;font-size:36px;font-weight:700;">✓</div>
                  <h2 style="margin:16px 0 0;font-family:Rubik,Arial,sans-serif;font-size:24px;line-height:1.3;font-weight:600;color:#1b1b1e;">בקשה/רעיון הושלם</h2>
                </td>
              </tr>
            </table>
            <!-- Body -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0 0 8px;font-family:'Work Sans',Arial,sans-serif;font-size:18px;line-height:1.6;color:#1b1b1e;">שלום ${safeName},</p>
                  <p style="margin:0 0 24px;font-family:'Work Sans',Arial,sans-serif;font-size:16px;line-height:1.5;color:#44474d;">${safeBody}</p>

                  <!-- Info card -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0d223f;border-radius:8px;border-right:4px solid #fdc003;">
                    <tr>
                      <td style="padding:16px;">
                        <p style="margin:0 0 10px;font-family:'Work Sans',Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;">✓ ${safeTitle}</p>
                        ${safeDesc}
                        <p style="margin:12px 0 0;font-family:'Work Sans',Arial,sans-serif;font-size:15px;line-height:1.5;color:#778aac;">
                          סטטוס: <strong style="color:#009e52;">הושלם</strong>
                        </p>
                        <p style="margin:6px 0 0;font-family:'Work Sans',Arial,sans-serif;font-size:15px;line-height:1.5;color:#778aac;">
                          סומן כהושלם על ידי: <strong style="color:#ffffff;">${safeActor}</strong>
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                    <tr>
                      <td align="center">
                        <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background-color:#000b20;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-family:Rubik,Arial,sans-serif;font-size:16px;font-weight:600;">
                          צפייה בבקשה/רעיון באפליקציה
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <!-- Footer strip -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#dbd9dc;border-top:1px solid #c4c6ce;">
              <tr>
                <td style="padding:14px 24px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#44474d;">
                  Version: 1.2 · Owner: Nir Nagar
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Legal footer -->
        <tr>
          <td align="center" style="padding:28px 8px 0;">
            <p style="margin:0;font-family:'JetBrains Mono',monospace;font-size:12px;color:#44474d;opacity:0.7;">
              © ${year} Ogen — צוות פיתוח ובקרה. כל הזכויות שמורות.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
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
    const appPublicUrl =
      Deno.env.get('APP_PUBLIC_URL')?.trim() || 'https://idea-teams-app.vercel.app'
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
