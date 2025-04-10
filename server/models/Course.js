import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  duration: { type: Number, required: true }, // in minutes
  capacity: { type: Number, required: true },
  year: { type: Number, required: true, min: 1, max: 4 }, // 1st, 2nd, 3rd, or 4th year
  branch: { type: String, required: true },
  division: { type: String, required: true },
  lectureType: { type: String, enum: ["theory", "lab"], required: true },
  preferredTimeSlots: [{ type: String }],
})

// Remove any existing indexes
courseSchema.index({ code: 1 }, { unique: false, background: true })

// Create a compound index for code, lectureType, division, year, and branch to ensure uniqueness
courseSchema.index({ code: 1, lectureType: 1, division: 1, year: 1, branch: 1 }, { unique: true, background: true })

export default mongoose.model("Course", courseSchema)
