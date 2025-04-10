import { getRandomItem, shuffleArray } from "./arrayUtils.js"

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const LAB_TIME_SLOTS = ["15:00", "16:00"] // Labs can only be scheduled between 3-5 PM

export async function generateSchedule(courses, rooms, teachers, year, branch, division) {
  // Check if we have enough courses to fill the schedule
  const totalSlots = DAYS.length * TIME_SLOTS.length

  // Group courses by their base code (removing any suffixes for lab variants)
  const courseGroups = {}

  courses.forEach((course) => {
    // Extract base code (assuming lab variants have the same code as theory)
    const baseCode = course.code.split("-")[0]
    if (!courseGroups[baseCode]) {
      courseGroups[baseCode] = []
    }
    courseGroups[baseCode].push(course)
  })

  // Calculate how many theory sessions each course should have
  const courseGroupCount = Object.keys(courseGroups).length
  const labSlotsNeeded = courseGroupCount // One lab per course group
  const theorySlotsAvailable = totalSlots - labSlotsNeeded * 2 // Labs take 2 slots each

  // Calculate theory sessions per course
  const theorySessionsPerCourse = Math.floor(theorySlotsAvailable / courseGroupCount)

  // If we don't have enough courses to fill all slots, we'll need to add more theory sessions
  let extraSessions = theorySlotsAvailable - theorySessionsPerCourse * courseGroupCount

  // Create a balanced schedule
  const schedule = []

  // First, schedule all lab sessions (they have more constraints)
  for (const baseCode in courseGroups) {
    const coursesInGroup = courseGroups[baseCode]
    const labCourse = coursesInGroup.find((c) => c.lectureType === "lab")
    const theoryCourse = coursesInGroup.find((c) => c.lectureType === "theory")

    if (labCourse) {
      // Schedule one lab session (2 consecutive hours) for this course
      let labScheduled = false

      // Try to schedule in lab time slots
      for (const day of shuffleArray([...DAYS])) {
        if (labScheduled) break

        // Labs need two consecutive slots
        const labStartTime = "15:00" // First lab slot

        // Find suitable lab rooms
        const labRooms = rooms.filter(
          (room) =>
            room.type === "lab" &&
            room.isAvailable &&
            (room.department === labCourse.branch || room.department === "All") &&
            (room.allowedYears.includes(labCourse.year) || room.allowedYears.length === 0),
        )

        if (labRooms.length === 0) continue

        const room = getRandomItem(labRooms)

        // Check if both slots are available
        const firstSlotFree = !schedule.some((slot) => slot.day === day && slot.startTime === "15:00")
        const secondSlotFree = !schedule.some((slot) => slot.day === day && slot.startTime === "16:00")

        if (firstSlotFree && secondSlotFree) {
          // Add the lab session (spans two time slots)
          schedule.push({
            course: labCourse,
            day,
            startTime: "15:00",
            room,
            isLabFirst: true,
          })

          schedule.push({
            course: labCourse,
            day,
            startTime: "16:00",
            room,
            isLabSecond: true,
          })

          labScheduled = true
        }
      }

      // If we couldn't schedule the lab with all constraints, try with fewer constraints
      if (!labScheduled) {
        for (const day of shuffleArray([...DAYS])) {
          if (labScheduled) break

          const labStartTime = "15:00"
          const room = getRandomItem(rooms.filter((r) => r.type === "lab" && r.isAvailable))

          if (!room) continue

          // Check if both slots are available
          const firstSlotFree = !schedule.some((slot) => slot.day === day && slot.startTime === "15:00")
          const secondSlotFree = !schedule.some((slot) => slot.day === day && slot.startTime === "16:00")

          if (firstSlotFree && secondSlotFree) {
            // Add the lab session (spans two time slots)
            schedule.push({
              course: labCourse,
              day,
              startTime: "15:00",
              room,
              isLabFirst: true,
            })

            schedule.push({
              course: labCourse,
              day,
              startTime: "16:00",
              room,
              isLabSecond: true,
            })

            labScheduled = true
          }
        }
      }
    }
  }

  // Now schedule theory sessions
  for (const baseCode in courseGroups) {
    const coursesInGroup = courseGroups[baseCode]
    const theoryCourse = coursesInGroup.find((c) => c.lectureType === "theory")

    if (!theoryCourse) continue

    // Determine how many theory sessions this course should have
    let sessionsToSchedule = theorySessionsPerCourse

    // Distribute extra sessions if needed
    if (extraSessions > 0) {
      sessionsToSchedule++
      extraSessions--
    }

    // Schedule the theory sessions
    let sessionsScheduled = 0

    // Try to distribute across different days
    const availableDays = [...DAYS]

    while (sessionsScheduled < sessionsToSchedule && availableDays.length > 0) {
      const day = availableDays.shift() // Take the next day

      // Find available time slots on this day (excluding lab slots)
      const availableSlots = TIME_SLOTS.filter(
        (slot) => !LAB_TIME_SLOTS.includes(slot) && !schedule.some((s) => s.day === day && s.startTime === slot),
      )

      if (availableSlots.length === 0) continue

      // Pick a random available slot
      const startTime = getRandomItem(availableSlots)

      // Find suitable rooms
      const suitableRooms = rooms.filter(
        (room) =>
          (room.type === "classroom" || room.type === "lecture-hall") &&
          room.isAvailable &&
          (room.department === theoryCourse.branch || room.department === "All") &&
          (room.allowedYears.includes(theoryCourse.year) || room.allowedYears.length === 0),
      )

      if (suitableRooms.length === 0) continue

      const room = getRandomItem(suitableRooms)

      // Add the theory session
      schedule.push({
        course: theoryCourse,
        day,
        startTime,
        room,
      })

      sessionsScheduled++
    }

    // If we couldn't schedule all sessions with day distribution,
    // fill in the remaining sessions wherever possible
    while (sessionsScheduled < sessionsToSchedule) {
      // Find any available slot
      let slotFound = false

      for (const day of shuffleArray([...DAYS])) {
        if (slotFound) break

        for (const startTime of shuffleArray([...TIME_SLOTS])) {
          if (LAB_TIME_SLOTS.includes(startTime)) continue // Skip lab slots

          // Check if slot is available
          const slotAvailable = !schedule.some((s) => s.day === day && s.startTime === startTime)

          if (slotAvailable) {
            const room = getRandomItem(
              rooms.filter((r) => (r.type === "classroom" || r.type === "lecture-hall") && r.isAvailable),
            )

            if (!room) continue

            // Add the theory session
            schedule.push({
              course: theoryCourse,
              day,
              startTime,
              room,
            })

            sessionsScheduled++
            slotFound = true
            break
          }
        }
      }

      // If we can't find any more slots, break to avoid infinite loop
      if (!slotFound) break
    }
  }

  // Fill any remaining empty slots with additional theory sessions
  const filledSchedule = fillRemainingSlots(schedule, courses, rooms, year, branch, division)

  return filledSchedule
}

function fillRemainingSlots(schedule, courses, rooms, year, branch, division) {
  const filledSchedule = [...schedule]

  // Create a map to track which slots are already filled
  const filledSlots = {}

  for (const slot of schedule) {
    const key = `${slot.day}-${slot.startTime}`
    filledSlots[key] = true
  }

  // Get all theory courses to distribute in empty slots
  const theoryCourses = courses.filter((course) => course.lectureType === "theory")

  if (theoryCourses.length === 0) return filledSchedule

  // Fill empty slots with theory courses
  let courseIndex = 0

  for (const day of DAYS) {
    for (const timeSlot of TIME_SLOTS) {
      const key = `${day}-${timeSlot}`

      if (!filledSlots[key]) {
        // Skip lab time slots that aren't already filled
        if (LAB_TIME_SLOTS.includes(timeSlot)) continue

        // Get the next theory course (cycling through them)
        const course = theoryCourses[courseIndex % theoryCourses.length]
        courseIndex++

        // Find a suitable room
        const suitableRooms = rooms.filter(
          (room) => (room.type === "classroom" || room.type === "lecture-hall") && room.isAvailable,
        )

        if (suitableRooms.length === 0) continue

        const room = getRandomItem(suitableRooms)

        // Add the theory session
        filledSchedule.push({
          course,
          day,
          startTime: timeSlot,
          room,
        })
      }
    }
  }

  return filledSchedule
}

// The rest of the helper functions remain the same
function isValidAssignment(course, day, startTime, room, schedule, teachers, division, relaxConstraints = false) {
  // Check if the room is available at the given time
  const roomConflict = schedule.find(
    (slot) => slot.day === day && slot.startTime === startTime && slot.room._id.toString() === room._id.toString(),
  )
  if (roomConflict) return false

  // Check if the instructor is available at the given time
  const instructorConflict = schedule.find(
    (slot) =>
      slot.day === day &&
      slot.startTime === startTime &&
      slot.course.instructor._id.toString() === course.instructor._id.toString(),
  )
  if (instructorConflict) return false

  // Get the teacher
  const teacher = teachers.find((t) => t._id.toString() === course.instructor._id.toString())

  if (teacher && !relaxConstraints) {
    // Check if the instructor has availability constraints
    if (teacher.availability && teacher.availability[day] && teacher.availability[day][startTime] === false) {
      return false
    }

    // Check if the instructor is allowed to teach this year
    if (teacher.teachableYears && !teacher.teachableYears.includes(course.year)) {
      return false
    }

    // Check if the instructor is in the same department
    if (teacher.department !== course.branch) {
      return false
    }
  }

  // Check if lab courses are scheduled in lab time slots
  if (course.lectureType === "lab" && !LAB_TIME_SLOTS.includes(startTime)) {
    return false
  }

  // Check if the room type matches the course type
  if (course.lectureType === "lab" && room.type !== "lab") {
    return false
  }

  // Check preferred time slots
  if (course.preferredTimeSlots && course.preferredTimeSlots.length > 0 && !relaxConstraints) {
    if (!course.preferredTimeSlots.includes(startTime)) {
      // Not a preferred time slot, but we'll still allow it with a penalty in fitness
      return true
    }
  }

  return true
}

function calculateFitness(schedule, teachers, division) {
  let fitness = schedule.length // Base fitness is the number of scheduled courses

  // Penalize for conflicts
  const conflicts = countConflicts(schedule, teachers, division)
  fitness -= conflicts * 10 // Heavy penalty for conflicts

  // Reward for preferred time slots
  for (const slot of schedule) {
    if (slot.course.preferredTimeSlots && slot.course.preferredTimeSlots.includes(slot.startTime)) {
      fitness += 2 // Bonus for using preferred time slots
    }
  }

  // Reward for lab courses scheduled in lab time slots
  for (const slot of schedule) {
    if (slot.course.lectureType === "lab" && LAB_TIME_SLOTS.includes(slot.startTime)) {
      fitness += 5 // Higher bonus for correctly scheduled labs
    }
  }

  // Reward for even distribution of courses across days and time slots
  const distribution = calculateDistribution(schedule)
  fitness += distribution

  return fitness
}

function countConflicts(schedule, teachers, division) {
  let conflicts = 0

  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      if (
        schedule[i].day === schedule[j].day &&
        schedule[i].startTime === schedule[j].startTime &&
        (schedule[i].room._id.toString() === schedule[j].room._id.toString() ||
          schedule[i].course.instructor._id.toString() === schedule[j].course.instructor._id.toString())
      ) {
        conflicts++
      }
    }
  }

  return conflicts
}

function calculateDistribution(schedule) {
  const dayDistribution = {}
  const timeDistribution = {}

  for (const slot of schedule) {
    dayDistribution[slot.day] = (dayDistribution[slot.day] || 0) + 1
    timeDistribution[slot.startTime] = (timeDistribution[slot.startTime] || 0) + 1
  }

  const dayVariance = calculateVariance(Object.values(dayDistribution))
  const timeVariance = calculateVariance(Object.values(timeDistribution))

  // Lower variance means more even distribution, so we return the inverse
  return 100 / (dayVariance + timeVariance + 1)
}

function calculateVariance(numbers) {
  if (numbers.length === 0) return 0
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  const squaredDifferences = numbers.map((num) => Math.pow(num - mean, 2))
  return squaredDifferences.reduce((sum, num) => sum + num, 0) / numbers.length
}

function selectParents(population, teachers, division) {
  // Tournament selection
  const tournamentSize = 5
  const parents = []

  for (let i = 0; i < 2; i++) {
    let bestIndividual = getRandomItem(population)
    let bestFitness = calculateFitness(bestIndividual, teachers, division)

    for (let j = 1; j < tournamentSize; j++) {
      const individual = getRandomItem(population)
      const fitness = calculateFitness(individual, teachers, division)

      if (fitness > bestFitness) {
        bestIndividual = individual
        bestFitness = fitness
      }
    }

    parents.push(bestIndividual)
  }

  return parents
}

function crossover(parent1, parent2) {
  const crossoverPoint = Math.floor(Math.random() * parent1.length)
  return [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)]
}

function mutate(schedule, theoryCourses, labCourses, rooms) {
  if (schedule.length === 0) return // Return early if the schedule is empty

  const indexToMutate = Math.floor(Math.random() * schedule.length)
  const slot = schedule[indexToMutate]

  // Randomly change one aspect of the slot
  const mutationType = Math.floor(Math.random() * 3)

  switch (mutationType) {
    case 0: // Change day
      slot.day = getRandomItem(DAYS)
      break
    case 1: // Change time
      // Ensure labs are only scheduled in lab time slots
      if (slot.course.lectureType === "lab") {
        slot.startTime = getRandomItem(LAB_TIME_SLOTS)
      } else {
        // For theory courses, avoid lab time slots
        const theoryTimeSlots = TIME_SLOTS.filter((slot) => !LAB_TIME_SLOTS.includes(slot))
        slot.startTime = getRandomItem(theoryTimeSlots)
      }
      break
    case 2: // Change room
      // Ensure room type matches course type
      if (slot.course.lectureType === "lab") {
        const labRooms = rooms.filter((room) => room.type === "lab" && room.isAvailable)
        if (labRooms.length > 0) {
          slot.room = getRandomItem(labRooms)
        }
      } else {
        const theoryRooms = rooms.filter(
          (room) => (room.type === "classroom" || room.type === "lecture-hall") && room.isAvailable,
        )
        if (theoryRooms.length > 0) {
          slot.room = getRandomItem(theoryRooms)
        }
      }
      break
  }
}

function findWorstIndividualIndex(population, teachers, division) {
  let worstIndex = 0
  let worstFitness = calculateFitness(population[0], teachers, division)

  for (let i = 1; i < population.length; i++) {
    const fitness = calculateFitness(population[i], teachers, division)
    if (fitness < worstFitness) {
      worstIndex = i
      worstFitness = fitness
    }
  }

  return worstIndex
}
