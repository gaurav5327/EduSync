import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "teacher", "student"], required: true },
  department: { type: String, required: true },
  // For teachers: which years they can teach
  teachableYears: [{ type: Number, min: 1, max: 4 }],
  // For students: which year they are in
  year: { type: Number, min: 1, max: 4 },
  // For students: which division they are in
  division: { type: String },
  // For teachers: their availability
  availability: {
    type: Map,
    of: {
      type: Map,
      of: Boolean,
    },
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

export default mongoose.model("User", userSchema)

