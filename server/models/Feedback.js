import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000 },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: true,
    },
    themes: {
      type: [String],
      enum: ['content', 'networking', 'venue', 'pacing', 'speakers', 'other'],
      default: [],
    },
    returnIntent: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

feedbackSchema.index({ eventId: 1, submittedAt: -1 })
feedbackSchema.index({ attendeeId: 1 }, { unique: true })

export default mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema)
