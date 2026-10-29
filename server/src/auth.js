import jwt from 'jsonwebtoken'

function getSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required for authentication')
  return process.env.JWT_SECRET
}

export function createAuthToken(user) {
  return jwt.sign({ username: user.username }, getSecret(), { subject: user._id.toString(), expiresIn: '2h' })
}

export function requireAuth(request, response, next) {
  const [scheme, token] = (request.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token) return response.status(401).json({ message: 'Bearer token required' })

  try {
    request.user = jwt.verify(token, getSecret())
    next()
  } catch {
    response.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function publicUser(user) {
  return { id: user._id, username: user.username, displayName: user.displayName }
}