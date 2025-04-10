import Queue from "bull"
import { resolveConflicts } from "./conflictResolution.js"
import Schedule from "../models/Schedule.js" // Import the Schedule model
import User from "../models/User.js" //Import the User model

const updateQueue = new Queue("schedule-updates", process.env.REDIS_URL)

updateQueue.process(async (job) => {
  const { scheduleId, updateType, updateData } = job.data

  try {
    const schedule = await Schedule.findById(scheduleId)

    if (updateType === "availability") {
      const user = await User.findById(updateData.userId)
      user.availability = updateData.availability
      await user.save()
    } else if (updateType === "preference") {
      const user = await User.findById(updateData.userId)
      user.preferences = updateData.preferences
      await user.save()
    }

    const result = await resolveConflicts(scheduleId)
    return result
  } catch (error) {
    console.error("Error processing update:", error)
    throw error
  }
})

export async function queueUpdate(scheduleId, updateType, updateData) {
  await updateQueue.add({ scheduleId, updateType, updateData })
}

