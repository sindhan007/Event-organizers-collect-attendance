import { OAuth2Client } from 'google-auth-library'

function getGoogleClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) return null
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
}

export function isGoogleAuthConfigured() {
  return Boolean(getGoogleClient())
}

export function getGoogleAuthorizationUrl() {
  const client = getGoogleClient()
  if (!client) return null
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  })
}

export async function exchangeGoogleCode(code) {
  const client = getGoogleClient()
  if (!client) throw new Error('Google authentication is not configured')
  const { tokens } = await client.getToken(code)
  if (!tokens.id_token) throw new Error('Google did not return an ID token')
  const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID })
  return ticket.getPayload()
}
