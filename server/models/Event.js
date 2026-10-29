import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    eventType: {
      type: String,
      enum: ['conference', 'workshop', 'community', 'roundtable', 'other'],
      default: 'other',
    },
    startsAt: { type: Date, required: true },
    endsAt: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.startsAt || value > this.startsAt
        },
        message: 'Event end time must be after its start time',
      },
    },
    venue: { type: String, trim: true, maxlength: 160 },
    capacity: { type: Number, min: 1, required: true },
    registrationCount: { type: Number, min: 0, default: 0 },
    attendanceCount: { type: Number, min: 0, default: 0 },
    feedbackCount: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    metrics: {
      engagementScore: { type: Number, min: 0, max: 100, default: 0 },
      attendanceRate: { type: Number, min: 0, max: 100, default: 0 },
      feedbackRate: { type: Number, min: 0, max: 100, default: 0 },
      returnIntent: { type: Number, min: 0, max: 100, default: 0 },
      sentimentScore: { type: Number, min: -1, max: 1, default: 0 },
    },
  },
  { timestamps: true },
)

eventSchema.index({ ownerId: 1, startsAt: -1 })

eventSchema.virtual('attendees', {
  ref: 'Attendee',
  localField: '_id',
  foreignField: 'eventId',
})

eventSchema.virtual('feedback', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'eventId',
})

eventSchema.set('toJSON', { virtuals: true })
eventSchema.set('toObject', { virtuals: true })

export default mongoose.models.Event || mongoose.model('Event', eventSchema)
