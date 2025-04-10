import mongoose from "mongoose"

const scheduleSchema = new mongoose.Schema({
  year: { type: Number, required: true, min: 1, max: 4 },
  branch: { type: String, required: true },
  division: { type: String, required: true },
  timetable: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
      },
      isLabFirst: { type: Boolean, default: false }, // First hour of a 2-hour lab
      isLabSecond: { type: Boolean, default: false }, // Second hour of a 2-hour lab
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Schedule", scheduleSchema)
