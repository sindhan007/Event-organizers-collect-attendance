import mongoose from 'mongoose'

const attendeeSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    organization: { type: String, trim: true, maxlength: 160 },
    registrationStatus: {
      type: String,
      enum: ['registered', 'waitlisted', 'cancelled'],
      default: 'registered',
    },
    checkedInAt: { type: Date, default: null },
    feedbackSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

attendeeSchema.index({ eventId: 1, email: 1 }, { unique: true })
attendeeSchema.index({ eventId: 1, checkedInAt: 1 })

attendeeSchema.virtual('feedback', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'attendeeId',
  justOne: true,
})

attendeeSchema.set('toJSON', { virtuals: true })
attendeeSchema.set('toObject', { virtuals: true })

export default mongoose.models.Attendee || mongoose.model('Attendee', attendeeSchema)
