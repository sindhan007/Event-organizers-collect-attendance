import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 40,
      match: /^[a-z0-9._-]+$/,
      unique: true,
    },
    displayName: { type: String, required: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model('User', userSchema)