import Schedule from "../models/Schedule.js"
import Notification from "../models/Notification.js"
import { resolveConflicts } from "./conflictResolution.js"

export async function updateSchedule(teacherId) {
    // Find all schedules that include the teacher
    const schedules = await Schedule.find({
        "timetable.course.instructor": teacherId,
    }).populate({
        path: "timetable.course",
        populate: {
            path: "instructor",
        },
    })

    for (const schedule of schedules) {
        try {
            // Try to resolve conflicts using CSP
            const result = await resolveConflicts(schedule._id)

            if (!result.success) {
                // Create a notification for the admin
                const notification = new Notification({
                    type: "SCHEDULE_UPDATE_FAILED",
                    message: `Failed to update schedule for teacher ${teacherId}. Manual adjustment required.`,
                    data: { scheduleId: schedule._id, teacherId },
                })
                await notification.save()
            }
        } catch (error) {
            console.error("Error updating schedule:", error)
            // Create a notification for the admin
            const notification = new Notification({
                type: "SCHEDULE_UPDATE_ERROR",
                message: `Error updating schedule for teacher ${teacherId}: ${error.message}`,
                data: { scheduleId: schedule._id, teacherId, error: error.message },
            })
            await notification.save()
        }
    }
}

