import Schedule from "../models/Schedule.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import { sendNotificationToAdmins } from "./notificationService.js";
import { solveScheduleCSP } from "../utils/cspSolver.js";

export async function resolveConflicts(scheduleId) {
  const schedule = await Schedule.findById(scheduleId).populate({
    path: "timetable.course",
    populate: { path: "instructor" },
  });

  const conflicts = [];

  // Check for conflicts
  for (let i = 0; i < schedule.timetable.length; i++) {
    for (let j = i + 1; j < schedule.timetable.length; j++) {
      if (
        schedule.timetable[i].day === schedule.timetable[j].day &&
        schedule.timetable[i].startTime === schedule.timetable[j].startTime
      ) {
        if (schedule.timetable[i].room === schedule.timetable[j].room) {
          conflicts.push({ type: "room", slots: [i, j] });
        }
        if (
          schedule.timetable[i].course.instructor._id.toString() ===
          schedule.timetable[j].course.instructor._id.toString()
        ) {
          conflicts.push({ type: "instructor", slots: [i, j] });
        }
      }
    }
  }

  let solution = null;

  if (conflicts.length > 0) {
    solution = solveScheduleCSP(schedule, conflicts);

    if (solution) {
      for (const [conflictId, resolution] of Object.entries(solution)) {
        const conflict = conflicts.find((c) => c._id.toString() === conflictId);
        if (resolution.type === "room") {
          schedule.timetable[conflict.slots[1]].room = resolution.value;
        } else {
          const { day, startTime } = resolution.value;
          schedule.timetable[conflict.slots[1]].day = day;
          schedule.timetable[conflict.slots[1]].startTime = startTime;
        }
      }
      await schedule.save();
    } else {
      const message = `There are ${conflicts.length} unresolved conflicts in the schedule. Please review and resolve manually.`;
      await sendNotificationToAdmins(message);
    }
  }

  return { schedule, conflicts: solution ? [] : conflicts };
}

async function findAvailableRoom(schedule, slotIndex) {
  const slot = schedule.timetable[slotIndex];
  const course = await Course.findById(slot.course);
  const rooms = await Room.find({ capacity: { $gte: course.capacity } });

  for (const room of rooms) {
    const isAvailable = !schedule.timetable.some(
      (s) =>
        s.day === slot.day &&
        s.startTime === slot.startTime &&
        s.room.toString() === room._id.toString()
    );
    if (isAvailable) {
      return room;
    }
  }

  return null;
}

async function rescheduleClass(schedule, slotIndex) {
  const slot = schedule.timetable[slotIndex];
  const course = await Course.findById(slot.course);
  const instructor = await User.findById(course.instructor);

  const availableSlots = instructor.availability.flatMap((day) =>
    day.timeSlots.map((time) => ({ day: day.day, startTime: time }))
  );

  for (const availableSlot of availableSlots) {
    const isSlotFree = !schedule.timetable.some(
      (s) =>
        s.day === availableSlot.day &&
        s.startTime === availableSlot.startTime &&
        (s.room.toString() === slot.room.toString() ||
          s.course.instructor.toString() === course.instructor.toString())
    );

    if (isSlotFree) {
      slot.day = availableSlot.day;
      slot.startTime = availableSlot.startTime;
      return true; // Return true to indicate successful rescheduling
    }
  }

  // If no suitable slot is found, mark the class as unscheduled
  slot.day = "Unscheduled";
  slot.startTime = "Unscheduled";
  slot.room = null;
  return false; // Return false to indicate failure to reschedule
}
