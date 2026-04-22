// Supabase Edge Function — Gemini API Proxy
// This keeps the GEMINI_API_KEY server-side, never exposed to the browser.
//
// Deploy: supabase functions deploy gemini-proxy --no-verify-jwt
// Set secret: supabase secrets set GEMINI_API_KEY=your-key-here

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  // Verify the user is authenticated via Supabase JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing Authorization header' }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const body = await req.json()

    // Validate payload structure
    if (!body.contents || !Array.isArray(body.contents)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body: missing contents array' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    // Forward to Gemini with server-side API key
    let res: Response | null = null
    let retries = 2

    while (retries >= 0) {
      res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: body.contents,
          generationConfig: body.generationConfig ?? {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.95,
          },
        }),
      })

      if (res.ok) break

      if (res.status === 503 && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        retries--
      } else {
        break
      }
    }

    if (!res || !res.ok) {
      const errBody = await res?.json().catch(() => ({}))
      return new Response(
        JSON.stringify({
          error: (errBody as Record<string, Record<string, string>>)?.error?.message || res?.statusText || 'Gemini request failed',
        }),
        {
          status: res?.status ?? 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      )
    }

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
})
