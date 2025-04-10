import express from "express"
import Course from "../models/Course.js"
import Room from "../models/Room.js"
import Schedule from "../models/Schedule.js"
import { generateSchedule } from "../utils/geneticAlgorithm.js"
import nodemailer from "nodemailer"
import Notification from "../models/Notification.js"
import User from "../models/User.js"
import { updateSchedule } from "../utils/scheduleUtils.js"

const router = express.Router()

// Get all courses for a specific year, branch, and division
router.get("/courses", async (req, res) => {
  try {
    const { year, branch, division } = req.query
    const courses = await Course.find({ year: Number.parseInt(year), branch, division }).populate("instructor")
    res.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get the number of subjects taught by an instructor in a specific division
router.get("/instructor-subjects", async (req, res) => {
  try {
    const { instructorId, division } = req.query
    const count = await Course.countDocuments({ instructor: instructorId, division })
    res.json({ count })
  } catch (error) {
    console.error("Error fetching instructor subjects:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all instructors
router.get("/instructors", async (req, res) => {
  try {
    const instructors = await User.find({ role: "teacher" })
    res.json(instructors)
  } catch (error) {
    console.error("Error fetching instructors:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all teachers
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
    res.json(teachers)
  } catch (error) {
    console.error("Error fetching teachers:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get public teacher information
router.get("/teachers-public", async (req, res) => {
  try {
    // Only return necessary public information about teachers
    const teachers = await User.find({ role: "teacher" }, { name: 1, department: 1, teachableYears: 1 })
    res.json(teachers)
  } catch (error) {
    console.error("Error fetching public teacher information:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get teacher data
router.get("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params
    const teacher = await User.findById(id)

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    res.json(teacher)
  } catch (error) {
    console.error("Error fetching teacher data:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get courses taught by a teacher
router.get("/teacher-courses/:id", async (req, res) => {
  try {
    const { id } = req.params
    const courses = await Course.find({ instructor: id })
    res.json(courses)
  } catch (error) {
    console.error("Error fetching teacher courses:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get schedules for a teacher
router.get("/teacher-schedules/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Find all courses taught by this teacher
    const courses = await Course.find({ instructor: id })
    const courseIds = courses.map((course) => course._id)

    // Find all schedules that include these courses
    const schedules = await Schedule.find({ "timetable.course": { $in: courseIds } })
      .populate({
        path: "timetable.course",
        populate: {
          path: "instructor",
        },
      })
      .populate("timetable.room")
      .sort({ year: 1, branch: 1, division: 1 })

    res.json(schedules)
  } catch (error) {
    console.error("Error fetching teacher schedules:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all rooms
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find()
    res.json(rooms)
  } catch (error) {
    console.error("Error fetching rooms:", error)
    res.status(500).json({ message: error.message })
  }
})

// Add a new room
router.post("/rooms", async (req, res) => {
  try {
    const { name, capacity, type, department, allowedYears, isAvailable } = req.body
    const newRoom = new Room({
      name,
      capacity,
      type,
      department,
      allowedYears,
      isAvailable,
    })
    await newRoom.save()
    res.status(201).json(newRoom)
  } catch (error) {
    console.error("Error creating room:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all timetables for a specific year, branch, and division
router.get("/timetables", async (req, res) => {
  try {
    const { year, branch, division } = req.query
    const query = {}

    if (year) query.year = Number.parseInt(year)
    if (branch) query.branch = branch
    if (division) query.division = division

    const timetables = await Schedule.find(query).sort({ createdAt: -1 })
    res.json(timetables)
  } catch (error) {
    console.error("Error fetching timetables:", error)
    res.status(500).json({ message: error.message })
  }
})

// Delete a timetable
router.delete("/timetables/:id", async (req, res) => {
  try {
    const { id } = req.params
    await Schedule.findByIdAndDelete(id)
    res.status(200).json({ message: "Timetable deleted successfully" })
  } catch (error) {
    console.error("Error deleting timetable:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get the latest schedule for a specific year, branch, and division
router.get("/latest", async (req, res) => {
  try {
    const { year, branch, division } = req.query
    const latestSchedule = await Schedule.findOne({ year: Number.parseInt(year), branch, division })
      .sort({ _id: -1 })
      .populate({
        path: "timetable.course",
        populate: {
          path: "instructor",
          select: "name",
        },
      })
      .populate("timetable.room")
    if (!latestSchedule) {
      return res.status(404).json({ message: "No schedules found. Please generate a schedule first." })
    }

    res.json(latestSchedule)
  } catch (error) {
    console.error("Error fetching latest schedule:", error)
    res.status(500).json({ message: error.message })
  }
})

// Generate a schedule for a specific year, branch, and division
router.post("/generate", async (req, res) => {
  try {
    const { year, branch, division } = req.body
    const courses = await Course.find({ year: Number.parseInt(year), branch, division }).populate("instructor")
    const rooms = await Room.find()

    // Instead of using TeacherRestriction, we'll use the constraints from the User model
    const teachers = await User.find({ role: "teacher" })

    const generatedSchedule = await generateSchedule(courses, rooms, teachers, year, branch, division)

    const newSchedule = new Schedule({
      year: Number.parseInt(year),
      branch,
      division,
      timetable: generatedSchedule,
      createdAt: new Date(),
    })

    await newSchedule.save()
    res.status(201).json(newSchedule)
  } catch (error) {
    console.error("Error generating schedule:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update the course creation route to check teacher constraints and handle duplicate course codes
router.post("/courses", async (req, res) => {
  try {
    const { name, code, instructor, duration, capacity, year, branch, division, lectureType, preferredTimeSlots } =
      req.body

    console.log("Received course data:", {
      name,
      code,
      instructor,
      duration,
      capacity,
      year,
      branch,
      division,
      lectureType,
      preferredTimeSlots: preferredTimeSlots || [],
    })

    // Check if the instructor is allowed to teach this year
    const teacher = await User.findById(instructor)
    if (!teacher) {
      return res.status(404).json({ message: "Instructor not found" })
    }

    if (teacher.role !== "teacher") {
      return res.status(400).json({ message: "Selected user is not a teacher" })
    }

    if (teacher.teachableYears && !teacher.teachableYears.includes(Number.parseInt(year))) {
      return res.status(400).json({ message: "This teacher is not allowed to teach this year" })
    }

    if (teacher.department !== branch) {
      return res.status(400).json({ message: "This teacher is not in the same department" })
    }

    // Check if the instructor has already been assigned to 2 subjects in this division
    const count = await Course.countDocuments({ instructor, division })
    if (count >= 2) {
      return res
        .status(400)
        .json({ message: "This instructor has already been assigned to 2 subjects in this division" })
    }

    // Check if a course with the same code, lecture type, division, year, and branch already exists
    const existingCourse = await Course.findOne({
      code,
      lectureType,
      division,
      year: Number.parseInt(year),
      branch,
    })

    if (existingCourse) {
      return res.status(400).json({
        message: `A ${lectureType} course with code ${code} already exists for Year ${year}, ${branch}, Division ${division}`,
      })
    }

    // Ensure lab courses have preferred time slots in the allowed range
    let finalPreferredTimeSlots = preferredTimeSlots || []
    if (lectureType === "lab" && (!finalPreferredTimeSlots || finalPreferredTimeSlots.length === 0)) {
      // Automatically set preferred time slots for labs if none are provided
      finalPreferredTimeSlots = ["15:00", "16:00"]
    }

    const newCourse = new Course({
      name,
      code,
      instructor,
      duration,
      capacity,
      year: Number.parseInt(year),
      branch,
      division,
      lectureType,
      preferredTimeSlots: finalPreferredTimeSlots,
    })

    console.log("Creating new course:", newCourse)

    const savedCourse = await newCourse.save()
    console.log("Course saved successfully:", savedCourse)

    res.status(201).json(savedCourse)
  } catch (error) {
    console.error("Error creating course:", error)

    if (error.name === "MongoServerError" && error.code === 11000) {
      // Extract the duplicate key error details
      const keyPattern = error.keyPattern || {}
      const keyValue = error.keyValue || {}

      console.error("Duplicate key error:", { keyPattern, keyValue })

      return res.status(400).json({
        message: "A course with this code and lecture type already exists for this division",
        details: { keyPattern, keyValue },
      })
    }

    res.status(500).json({ message: error.message })
  }
})

// Debug endpoint to check existing courses
router.get("/debug/courses", async (req, res) => {
  try {
    const { code } = req.query
    const query = {}

    if (code) {
      query.code = code
    }

    const courses = await Course.find(query).populate("instructor")
    res.json(courses)
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    res.status(500).json({ message: error.message })
  }
})

// Handle teacher availability updates
router.post("/teacher-availability", async (req, res) => {
  try {
    const { teacherId, availability } = req.body

    // Create a new notification for the admin
    const notification = new Notification({
      type: "AVAILABILITY_UPDATE",
      message: `Teacher ${teacherId} has requested an availability update.`,
      data: { teacherId, availability },
    })
    await notification.save()

    // Send email notification to admin
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "admin@example.com", // This should be fetched from the database
      subject: "Teacher Availability Update Request",
      text: `Teacher ${teacherId} has requested an availability update. Please check the admin dashboard for details.`,
    })

    res.status(200).json({ message: "Availability update request sent successfully" })
  } catch (error) {
    console.error("Error updating teacher availability:", error)
    res.status(500).json({ message: error.message })
  }
})

// Handle notifications
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ status: "PENDING" }).sort("-createdAt")
    res.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: error.message })
  }
})

router.post("/notifications/:id/:action", async (req, res) => {
  try {
    const { id, action } = req.params
    const notification = await Notification.findById(id)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    if (action === "approve") {
      // Update teacher availability
      await User.findByIdAndUpdate(notification.data.teacherId, { availability: notification.data.availability })

      // Update the schedule
      await updateSchedule(notification.data.teacherId)
    }

    notification.status = action === "approve" ? "APPROVED" : "REJECTED"
    await notification.save()

    res.json({ message: `Notification ${action}d successfully` })
  } catch (error) {
    console.error(`Error ${req.params.action}ing notification:`, error)
    res.status(500).json({ message: error.message })
  }
})

// Resolve conflicts
router.post("/resolve-conflicts", async (req, res) => {
  try {
    const { year, branch, division } = req.body

    // Find the latest schedule
    const schedule = await Schedule.findOne({ year: Number.parseInt(year), branch, division })
      .sort({ _id: -1 })
      .populate({
        path: "timetable.course",
        populate: {
          path: "instructor",
        },
      })
      .populate("timetable.room")

    if (!schedule) {
      return res.status(404).json({ message: "No schedule found to resolve conflicts" })
    }

    // Import the conflict resolution function
    const { resolveConflicts } = await import("../utils/conflictResolution.js")

    // Resolve conflicts
    const result = await resolveConflicts(schedule._id)

    if (result.success) {
      res.json(result.schedule)
    } else {
      res.status(400).json({ message: result.message })
    }
  } catch (error) {
    console.error("Error resolving conflicts:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get all courses (for dropdown selection)
router.get("/courses-all", async (req, res) => {
  try {
    const courses = await Course.find().sort({ code: 1, lectureType: 1 })
    res.json(courses)
  } catch (error) {
    console.error("Error fetching all courses:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
