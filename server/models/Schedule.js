import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  timetable: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      startTime: { type: String },
      endTime: { type: String },
    },
  ],
  fitness: { type: Number, default: 0 },
});

export default mongoose.model("Schedule", scheduleSchema);
