import express from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { Attendee, Event, Feedback, User } from '../models/index.js'
import { createAuthToken, publicUser, requireAuth } from './auth.js'

export const app = express()

app.use(express.json())

function pickFields(source, fields) {
  return fields.reduce((result, field) => {
    if (source[field] !== undefined) result[field] = source[field]
    return result
  }, {})
}

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'gatherwell-api' })
})

app.post('/api/auth/register', async (request, response, next) => {
  try {
    const { username, password, displayName } = request.body
    if (!username || !password || !displayName) {
      return response.status(400).json({ message: 'username, password, and displayName are required' })
    }
    if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ username, displayName, passwordHash })
    response.status(201).json({ user: publicUser(user), token: createAuthToken(user) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const { username, password } = request.body
    const user = await User.findOne({ username: username?.toLowerCase() }).select('+passwordHash')
    const passwordMatches = user && await bcrypt.compare(password || '', user.passwordHash)
    if (!passwordMatches) return response.status(401).json({ message: 'Invalid username or password' })
    response.json({ user: publicUser(user), token: createAuthToken(user) })
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/me', requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.user.sub).lean()
    if (!user) return response.status(404).json({ message: 'User not found' })
    response.json({ user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

app.get('/api/events', async (request, response, next) => {
  try {
    const filter = request.query.ownerId ? { ownerId: request.query.ownerId } : {}
    const events = await Event.find(filter).sort({ startsAt: -1 }).lean()
    response.json(events)
  } catch (error) {
    next(error)
  }
})

app.post('/api/events', async (request, response, next) => {
  try {
    const event = await Event.create(request.body)
    response.status(201).json(event)
  } catch (error) {
    next(error)
  }
})

app.get('/api/events/:eventId', async (request, response, next) => {
  try {
    const event = await Event.findById(request.params.eventId)
      .populate('attendees')
      .populate('feedback')
      .lean({ virtuals: true })
    if (!event) return response.status(404).json({ message: 'Event not found' })
    response.json(event)
  } catch (error) {
    next(error)
  }
})

app.get('/api/events/:eventId/attendees', async (request, response, next) => {
  try {
    const event = await Event.exists({ _id: request.params.eventId })
    if (!event) return response.status(404).json({ message: 'Event not found' })

    const attendees = await Attendee.find({ eventId: request.params.eventId })
      .sort({ createdAt: -1 })
      .lean()
    response.json(attendees)
  } catch (error) {
    next(error)
  }
})

app.get('/api/events/:eventId/feedback', async (request, response, next) => {
  try {
    const event = await Event.exists({ _id: request.params.eventId })
    if (!event) return response.status(404).json({ message: 'Event not found' })

    const feedback = await Feedback.find({ eventId: request.params.eventId })
      .sort({ submittedAt: -1 })
      .populate('attendeeId', 'name organization')
      .lean()
    response.json(feedback)
  } catch (error) {
    next(error)
  }
})

app.get('/api/events/:eventId/analytics', async (request, response, next) => {
  try {
    const [event, attendeeCount, attendedCount, feedbackCount, feedbackSummary] = await Promise.all([
      Event.findById(request.params.eventId).lean(),
      Attendee.countDocuments({ eventId: request.params.eventId }),
      Attendee.countDocuments({ eventId: request.params.eventId, checkedInAt: { $ne: null } }),
      Feedback.countDocuments({ eventId: request.params.eventId }),
      Feedback.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(request.params.eventId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            positiveCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
            returnIntentCount: { $sum: { $cond: ['$returnIntent', 1, 0] } },
          },
        },
      ]),
    ])

    if (!event) return response.status(404).json({ message: 'Event not found' })

    const summary = feedbackSummary[0] || { averageRating: 0, positiveCount: 0, returnIntentCount: 0 }
    response.json({
      eventId: event._id,
      registrationCount: attendeeCount,
      attendanceCount: attendedCount,
      feedbackCount,
      attendanceRate: attendeeCount ? Math.round((attendedCount / attendeeCount) * 100) : 0,
      feedbackRate: attendeeCount ? Math.round((feedbackCount / attendeeCount) * 100) : 0,
      averageRating: Number((summary.averageRating || 0).toFixed(2)),
      positiveSentimentRate: feedbackCount ? Math.round((summary.positiveCount / feedbackCount) * 100) : 0,
      returnIntentRate: feedbackCount ? Math.round((summary.returnIntentCount / feedbackCount) * 100) : 0,
    })
  } catch (error) {
    next(error)
  }
})

app.put('/api/events/:eventId', async (request, response, next) => {
  try {
    const updates = pickFields(request.body, [
      'title',
      'description',
      'eventType',
      'startsAt',
      'endsAt',
      'venue',
      'capacity',
      'status',
    ])
    const event = await Event.findByIdAndUpdate(request.params.eventId, updates, {
      new: true,
      runValidators: true,
    }).lean()
    if (!event) return response.status(404).json({ message: 'Event not found' })
    response.json(event)
  } catch (error) {
    next(error)
  }
})

app.put('/api/events/:eventId/attendees/:attendeeId', async (request, response, next) => {
  try {
    const updates = pickFields(request.body, ['name', 'organization', 'registrationStatus'])
    const attendee = await Attendee.findOneAndUpdate(
      { _id: request.params.attendeeId, eventId: request.params.eventId },
      updates,
      { new: true, runValidators: true },
    ).lean()
    if (!attendee) return response.status(404).json({ message: 'Attendee not found for this event' })
    response.json(attendee)
  } catch (error) {
    next(error)
  }
})

app.post('/api/events/:eventId/check-in', async (request, response, next) => {
  try {
    const { attendeeId } = request.body
    const attendee = await Attendee.findOne({ _id: attendeeId, eventId: request.params.eventId })
    if (!attendee) return response.status(404).json({ message: 'Attendee not found for this event' })
    if (attendee.checkedInAt) return response.json(attendee)

    attendee.checkedInAt = new Date()
    await attendee.save()
    await Event.findByIdAndUpdate(request.params.eventId, { $inc: { attendanceCount: 1 } })
    response.json(attendee)
  } catch (error) {
    next(error)
  }
})

app.post('/api/events/:eventId/attendees', async (request, response, next) => {
  try {
    const attendee = await Attendee.create({ ...request.body, eventId: request.params.eventId })
    await Event.findByIdAndUpdate(request.params.eventId, { $inc: { registrationCount: 1 } })
    response.status(201).json(attendee)
  } catch (error) {
    next(error)
  }
})

app.post('/api/events/:eventId/feedback', async (request, response, next) => {
  try {
    const feedback = await Feedback.create({ ...request.body, eventId: request.params.eventId })
    await Attendee.findByIdAndUpdate(feedback.attendeeId, { feedbackSubmitted: true })
    await Event.findByIdAndUpdate(request.params.eventId, { $inc: { feedbackCount: 1 } })
    response.status(201).json(feedback)
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: 'Validation failed', fields: error.errors })
  }
  if (error.name === 'CastError') {
    return response.status(400).json({ message: 'Invalid identifier' })
  }
  if (error.code === 11000) {
    return response.status(409).json({ message: 'A record with these details already exists' })
  }
  console.error(error)
  response.status(500).json({ message: 'Unexpected server error' })
})