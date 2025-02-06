import express from "express";
import Course from "../models/Course.js";
import Room from "../models/Room.js";
import Schedule from "../models/Schedule.js";
import User from "../models/User.js";
import { generateSchedule } from "../utils/geneticAlgorithm.js";
import { queueUpdate } from "../services/updateQueue.js";
import { resolveConflicts } from "../services/conflictResolution.js";

const router = express.Router();

// Get all courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor");
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all rooms
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all instructors
router.get("/instructors", async (req, res) => {
  try {
    const instructors = await User.find({ role: "teacher" });
    res.json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get the latest schedule
router.get("/latest", async (req, res) => {
  try {
    const latestSchedule = await Schedule.findOne()
      .sort({ _id: -1 })
      .populate({
        path: "timetable.course",
        populate: {
          path: "instructor",
          select: "name",
        },
      })
      .populate("timetable.room");
    if (!latestSchedule) {
      return res
        .status(404)
        .json({
          message: "No schedules found. Please generate a schedule first.",
        });
    }

    // Ensure all time slots are filled
    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const TIME_SLOTS = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    const filledSchedule = {
      ...latestSchedule.toObject(),
      timetable: DAYS.flatMap((day) =>
        TIME_SLOTS.map((timeSlot) => {
          const existingSlot = latestSchedule.timetable.find(
            (slot) => slot.day === day && slot.startTime === timeSlot
          );
          return (
            existingSlot || {
              course: null,
              room: null,
              day,
              startTime: timeSlot,
              endTime:
                TIME_SLOTS[
                  Math.min(
                    TIME_SLOTS.indexOf(timeSlot) + 1,
                    TIME_SLOTS.length - 1
                  )
                ],
            }
          );
        })
      ),
    };

    res.json(filledSchedule);
  } catch (error) {
    console.error("Error fetching latest schedule:", error);
    res.status(500).json({ message: error.message });
  }
});

// Generate a schedule
router.post("/generate", async (req, res) => {
  try {
    const generatedSchedule = await generateSchedule();
    res.status(201).json(generatedSchedule);
  } catch (error) {
    console.error("Error generating schedule:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new course
router.post("/courses", async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(400).json({ message: error.message });
  }
});

// Add a new room
router.post("/rooms", async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error("Error adding room:", error);
    res.status(400).json({ message: error.message });
  }
});

// Create a test schedule (for development purposes)
router.post("/create-test-schedule", async (req, res) => {
  try {
    const testCourse = new Course({
      name: "Test Course",
      code: "TST101",
      instructor: "Test Instructor",
      duration: 60,
      capacity: 30,
      description: "This is a test course",
      preferredTimeSlots: ["09:00", "10:00"],
    });
    await testCourse.save();

    const testRoom = new Room({
      name: "Test Room",
      capacity: 50,
    });
    await testRoom.save();

    const testSchedule = new Schedule({
      courses: [testCourse._id],
      rooms: [testRoom._id],
      timetable: [
        {
          course: testCourse._id,
          room: testRoom._id,
          day: "Monday",
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
      fitness: 1,
    });
    await testSchedule.save();

    res
      .status(201)
      .json({
        message: "Test schedule created successfully",
        schedule: testSchedule,
      });
  } catch (error) {
    console.error("Error creating test schedule:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update the route to handle real-time updates
router.post("/update", async (req, res) => {
  try {
    const { type, userId, data } = req.body;

    // Get the latest schedule
    const latestSchedule = await Schedule.findOne().sort({ createdAt: -1 });

    // Queue the update
    await queueUpdate(latestSchedule._id, type, { userId, [type]: data });

    res.json({ message: "Update queued successfully" });
  } catch (error) {
    console.error("Error queueing update:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new route to get conflicts
router.get("/conflicts", async (req, res) => {
  try {
    const latestSchedule = await Schedule.findOne().sort({ createdAt: -1 });
    const { conflicts } = await resolveConflicts(latestSchedule._id);
    res.json({ conflicts, schedule: latestSchedule });
  } catch (error) {
    console.error("Error fetching conflicts:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new route to resolve conflicts manually
router.post("/resolve-conflict", async (req, res) => {
  try {
    const { conflictId, resolution } = req.body;
    const latestSchedule = await Schedule.findOne().sort({ createdAt: -1 });

    // Apply the resolution
    if (resolution.type === "changeRoom") {
      const conflict = latestSchedule.timetable.find(
        (slot) => slot._id.toString() === conflictId
      );
      conflict.room = resolution.roomId;
    } else if (resolution.type === "reschedule") {
      const conflict = latestSchedule.timetable.find(
        (slot) => slot._id.toString() === conflictId
      );
      const { day, startTime } = JSON.parse(resolution.slot);
      conflict.day = day;
      conflict.startTime = startTime;
    }

    await latestSchedule.save();
    res.json({ message: "Conflict resolved successfully" });
  } catch (error) {
    console.error("Error resolving conflict:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
