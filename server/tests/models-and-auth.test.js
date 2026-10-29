import { afterEach, describe, expect, it } from 'vitest'
import { Attendee, Event, Feedback, User } from '../models/index.js'
import { createAuthToken } from '../src/auth.js'
import jwt from 'jsonwebtoken'

const objectId = '507f1f77bcf86cd799439011'
const originalJwtSecret = process.env.JWT_SECRET

afterEach(() => {
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET
  else process.env.JWT_SECRET = originalJwtSecret
})

describe('Gatherwell data models', () => {
  it('accepts an event whose end is after its start', () => {
    const event = new Event({ ownerId: objectId, title: 'Forum', startsAt: '2026-11-10T09:00:00Z', endsAt: '2026-11-10T10:00:00Z', capacity: 20 })
    expect(event.validateSync()).toBeUndefined()
  })

  it('rejects an event whose end is before its start', () => {
    const event = new Event({ ownerId: objectId, title: 'Forum', startsAt: '2026-11-10T10:00:00Z', endsAt: '2026-11-10T09:00:00Z', capacity: 20 })
    expect(event.validateSync().errors.endsAt).toBeDefined()
  })

  it('rejects feedback ratings outside the one-to-five range', () => {
    const feedback = new Feedback({ eventId: objectId, attendeeId: '507f1f77bcf86cd799439012', rating: 6, sentiment: 'positive', returnIntent: true })
    expect(feedback.validateSync().errors.rating).toBeDefined()
  })

  it('normalizes attendee emails to lowercase', () => {
    const attendee = new Attendee({ eventId: objectId, name: 'Attendee', email: 'PERSON@EXAMPLE.COM' })
    attendee.validateSync()
    expect(attendee.email).toBe('person@example.com')
  })

  it('requires a valid username and display name for users', () => {
    const user = new User({ username: 'bad space', displayName: '', passwordHash: 'hash' })
    const error = user.validateSync()
    expect(error.errors.username).toBeDefined()
    expect(error.errors.displayName).toBeDefined()
  })
})

describe('JWT authentication', () => {
  it('creates a token with the user subject and username', () => {
    process.env.JWT_SECRET = 'test-secret'
    const token = createAuthToken({ _id: { toString: () => objectId }, username: 'organizer' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    expect(payload.sub).toBe(objectId)
    expect(payload.username).toBe('organizer')
  })

  it('requires JWT_SECRET before creating tokens', () => {
    delete process.env.JWT_SECRET
    expect(() => createAuthToken({ _id: { toString: () => objectId }, username: 'organizer' })).toThrow('JWT_SECRET is required')
  })
})