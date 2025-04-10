import Schedule from "../models/Schedule.js"
import Notification from "../models/Notification.js"
import Room from "../models/Room.js"

export async function resolveConflicts(scheduleId) {
  const schedule = await Schedule.findById(scheduleId)
    .populate({
      path: "timetable.course",
      populate: { path: "instructor" },
    })
    .populate("timetable.room")

  const resolvedSchedule = await applyCSP(schedule)

  if (resolvedSchedule) {
    schedule.timetable = resolvedSchedule
    await schedule.save()
    return { success: true, schedule }
  } else {
    const notification = new Notification({
      type: "CONFLICT_RESOLUTION_FAILED",
      message: `Failed to resolve conflicts for schedule ${scheduleId}. Manual adjustment required.`,
      data: { scheduleId },
    })
    await notification.save()
    return { success: false, message: "Unable to resolve conflicts automatically. Admin has been notified." }
  }
}

function applyCSP(schedule) {
  const variables = schedule.timetable
  const domains = generateDomains(schedule)
  const constraints = [roomConflict, teacherConflict, timeSlotConflict]

  return backtrackingSearch(variables, domains, constraints)
}

async function generateDomains(schedule) {
  const domains = {}
  const rooms = await Room.find()
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  for (const slot of schedule.timetable) {
    domains[slot._id] = []
    for (const room of rooms) {
      for (const day of days) {
        for (const time of timeSlots) {
          domains[slot._id].push({ room: room._id, day, startTime: time })
        }
      }
    }
  }

  return domains
}

function backtrackingSearch(variables, domains, constraints) {
  return backtrack({}, variables, domains, constraints)
}

function backtrack(assignment, variables, domains, constraints) {
  if (isComplete(assignment, variables)) {
    return assignment
  }

  const unassignedVar = selectUnassignedVariable(assignment, variables)
  for (const value of orderDomainValues(unassignedVar, assignment, domains)) {
    if (isConsistent(unassignedVar, value, assignment, constraints)) {
      assignment[unassignedVar._id] = value
      const result = backtrack(assignment, variables, domains, constraints)
      if (result !== null) {
        return result
      }
      delete assignment[unassignedVar._id]
    }
  }
  return null
}

function isComplete(assignment, variables) {
  return Object.keys(assignment).length === variables.length
}

function isConsistent(variable, value, assignment, constraints) {
  for (const constraint of constraints) {
    if (!constraint(variable, value, assignment)) {
      return false
    }
  }
  return true
}

function selectUnassignedVariable(assignment, variables) {
  return variables.find((v) => !assignment[v._id])
}

function orderDomainValues(variable, assignment, domains) {
  // Implement least constraining value heuristic
  return domains[variable._id].sort((a, b) => {
    const conflictsA = countConflicts(variable, a, assignment)
    const conflictsB = countConflicts(variable, b, assignment)
    return conflictsA - conflictsB
  })
}

function countConflicts(variable, value, assignment) {
  let conflicts = 0
  for (const [assignedVar, assignedValue] of Object.entries(assignment)) {
    if (
      value.room === assignedValue.room &&
      value.day === assignedValue.day &&
      value.startTime === assignedValue.startTime
    ) {
      conflicts++
    }
    if (
      variable.course.instructor._id === assignment[assignedVar].course.instructor._id &&
      value.day === assignedValue.day &&
      value.startTime === assignedValue.startTime
    ) {
      conflicts++
    }
  }
  return conflicts
}

function roomConflict(variable, value, assignment) {
  for (const [assignedVar, assignedValue] of Object.entries(assignment)) {
    if (
      value.room === assignedValue.room &&
      value.day === assignedValue.day &&
      value.startTime === assignedValue.startTime
    ) {
      return false
    }
  }
  return true
}

function teacherConflict(variable, value, assignment) {
  for (const [assignedVar, assignedValue] of Object.entries(assignment)) {
    if (
      variable.course.instructor._id === assignment[assignedVar].course.instructor._id &&
      value.day === assignedValue.day &&
      value.startTime === assignedValue.startTime
    ) {
      return false
    }
  }
  return true
}

function timeSlotConflict(variable, value, assignment) {
  // Check if the time slot conflicts with any existing assignments
  for (const [assignedVar, assignedValue] of Object.entries(assignment)) {
    if (value.day === assignedValue.day && value.startTime === assignedValue.startTime) {
      // Check if the courses have overlapping durations
      const assignedEndTime = new Date(
        new Date(`1970-01-01T${assignedValue.startTime}`).getTime() + assignment[assignedVar].course.duration * 60000,
      )
      const newEndTime = new Date(
        new Date(`1970-01-01T${value.startTime}`).getTime() + variable.course.duration * 60000,
      )

      if (
        assignedEndTime > new Date(`1970-01-01T${value.startTime}`) ||
        newEndTime > new Date(`1970-01-01T${assignedValue.startTime}`)
      ) {
        return false
      }
    }
  }
  return true
}

export async function updateSchedule(teacherId) {
  const schedules = await Schedule.find({ "timetable.course.instructor": teacherId })

  for (const schedule of schedules) {
    try {
      const resolvedSchedule = await resolveConflicts(schedule._id)
      if (!resolvedSchedule.success) {
        const notification = new Notification({
          type: "SCHEDULE_UPDATE_FAILED",
          message: `Failed to update schedule for teacher ${teacherId}. Manual adjustment required.`,
          data: { scheduleId: schedule._id, teacherId },
        })
        await notification.save()
      }
    } catch (error) {
      console.error("Error updating schedule:", error)
      const notification = new Notification({
        type: "SCHEDULE_UPDATE_ERROR",
        message: `Error updating schedule for teacher ${teacherId}: ${error.message}`,
        data: { scheduleId: schedule._id, teacherId, error: error.message },
      })
      await notification.save()
    }
  }
}

