const defaultPrompt = 'You are an event planning assistant. Return only the suggested text, with no markdown or explanation.'

export function isAiConfigured() {
  return Boolean(process.env.AI_API_KEY && process.env.AI_API_URL && process.env.AI_MODEL)
}

export async function completeText({ field, context }) {
  if (!isAiConfigured()) throw new Error('AI autocomplete is not configured')
  const response = await fetch(process.env.AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      temperature: 0.4,
      max_tokens: 120,
      messages: [
        { role: 'system', content: defaultPrompt },
        { role: 'user', content: `Complete the event ${field} using this context: ${context}` },
      ],
    }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error?.message || 'AI provider request failed')
  const suggestion = payload.choices?.[0]?.message?.content?.trim()
  if (!suggestion) throw new Error('AI provider returned no suggestion')
  return suggestion
}
