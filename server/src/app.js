import express from 'express'
import { Attendee, Event, Feedback } from '../models/index.js'

export const app = express()

app.use(express.json())

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'gatherwell-api' })
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
    const event = await Event.findById(request.params.eventId).lean()
    if (!event) return response.status(404).json({ message: 'Event not found' })
    response.json(event)
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