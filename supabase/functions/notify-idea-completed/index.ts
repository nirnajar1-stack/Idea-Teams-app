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

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('972')) return digits
  if (digits.startsWith('0') && digits.length >= 9) return `972${digits.slice(1)}`
  if (digits.length >= 9 && digits.length <= 10) return `972${digits}`
  return digits
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

async function sendWhatsAppTemplate(
  token: string,
  phoneNumberId: string,
  to: string,
  templateName: string,
  assigneeName: string,
  title: string,
  description: string,
): Promise<Response> {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'he' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: truncate(assigneeName, 60) },
              { type: 'text', text: truncate(title, 120) },
              { type: 'text', text: truncate(description, 400) },
            ],
          },
        ],
      },
    }),
  })
}

async function sendWhatsAppText(
  token: string,
  phoneNumberId: string,
  to: string,
  body: string,
): Promise<Response> {
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body, preview_url: false },
    }),
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const templateName = Deno.env.get('WHATSAPP_TEMPLATE_NAME') ?? 'idea_completed'
    const useTextFallback = Deno.env.get('WHATSAPP_USE_TEXT') === 'true'

    if (!token || !phoneNumberId) {
      return new Response(
        JSON.stringify({ ok: false, skipped: true, reason: 'whatsapp_not_configured' }),
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
      .select('id, title, description, workflow_status, assignee_user_id, created_by_user_id')
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

    const assigneeId = idea.assignee_user_id as string | null
    if (!assigneeId) {
      return new Response(JSON.stringify({ ok: false, skipped: true, reason: 'no_assignee' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: actor } = await admin
      .from('app_users')
      .select('id, access_level')
      .eq('id', actorUserId)
      .maybeSingle()

    const canNotify =
      actor &&
      (actor.id === idea.created_by_user_id ||
        actor.id === assigneeId ||
        actor.access_level === 'manager' ||
        actor.access_level === 'master')

    if (!canNotify) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: assignee } = await admin
      .from('app_users')
      .select('id, name, phone, active')
      .eq('id', assigneeId)
      .maybeSingle()

    if (!assignee?.active || !assignee.phone) {
      return new Response(JSON.stringify({ ok: false, skipped: true, reason: 'no_phone' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: prefs } = await admin
      .from('user_preferences')
      .select('notify_whatsapp_completed')
      .eq('user_id', assigneeId)
      .maybeSingle()

    if (prefs && prefs.notify_whatsapp_completed === false) {
      return new Response(JSON.stringify({ ok: false, skipped: true, reason: 'prefs_off' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const to = normalizePhone(assignee.phone as string)
    if (!to) {
      return new Response(JSON.stringify({ ok: false, skipped: true, reason: 'invalid_phone' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const assigneeName = (assignee.name as string) || 'משתמש'
    const title = (idea.title as string) || 'רעיון'
    const description = (idea.description as string) || ''

    let waRes: Response
    if (useTextFallback) {
      const body =
        `✅ *הרעיון הושלם — Ogen System*\n\n` +
        `שלום ${assigneeName},\n\n` +
        `*${title}*\n\n` +
        `${truncate(description, 800)}\n\n` +
        `_הודעה אוטומטית ממערכת Ogen_`
      waRes = await sendWhatsAppText(token, phoneNumberId, to, body)
    } else {
      waRes = await sendWhatsAppTemplate(
        token,
        phoneNumberId,
        to,
        templateName,
        assigneeName,
        title,
        description,
      )
    }

    const waJson = await waRes.json().catch(() => ({}))
    if (!waRes.ok) {
      console.error('WhatsApp API error', waJson)
      return new Response(
        JSON.stringify({ ok: false, error: 'whatsapp_send_failed', detail: waJson }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ ok: true, to, messageId: waJson.messages?.[0]?.id }),
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
