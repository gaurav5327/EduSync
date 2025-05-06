import express from "express"
import User from "../models/User.js"
import bcrypt from "bcrypt"
import auth from "../middleware/auth.js"

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, teachableYears, year, division, adminId, createdBy } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // If registering an admin, validate the admin ID
    if (role === "admin") {
      // Check if the provided admin ID matches the one in the environment variables
      if (adminId !== process.env.ADMIN_ID) {
        return res.status(403).json({ message: "Invalid Admin ID. Admin registration failed." })
      }
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
      role,
      department,
      createdBy,
    })

    // Add role-specific fields
    if (role === "teacher" && teachableYears) {
      newUser.teachableYears = teachableYears
    }

    if (role === "student") {
      newUser.year = year
      newUser.division = division
    }

    await newUser.save()
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({ message: error.message })
  }
})

// Login route
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt for:", req.body.email)
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      console.log("User not found:", email)
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      console.log("Password mismatch for:", email)
      return res.status(401).json({ message: "Invalid email or password" })
    }

    console.log("Login successful for:", email, "with role:", user.role)

    // Return user data (excluding password)
    const userData = {
      id: user._id.toString(), // Convert ObjectId to string
      name: user.name,
      email: user.email,
      role: user.role,
    }

    console.log("Sending user data:", userData)
    res.json(userData)
  } catch (error) {
    console.error("Error logging in:", error)
    res.status(500).json({ message: error.message })
  }
})

router.get("/user", auth, (req, res) => {
  res.json(req.user);
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "API is working correctly" })
})

export default router

