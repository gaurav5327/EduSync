import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  type: {
    type: String,
    required: true,
    enum: ["classroom", "lab", "lecture-hall"],
  },
  department: { type: String, required: true },
  allowedYears: [{ type: Number, min: 1, max: 4 }],
  isAvailable: { type: Boolean, default: true },
})

export default mongoose.model("Room", roomSchema)
