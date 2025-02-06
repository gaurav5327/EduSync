import Schedule from "../models/Schedule.js";
import Course from "../models/Course.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

const POPULATION_SIZE = 50;
const GENERATIONS = 100;
const MUTATION_RATE = 0.1;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export async function generateSchedule() {
  try {
    console.log("Starting schedule generation...");

    const courses = await Course.find().populate("instructor");
    const rooms = await Room.find();
    const users = await User.find({ role: { $in: ["teacher", "student"] } });

    console.log(
      `Courses: ${courses.length}, Rooms: ${rooms.length}, Users: ${users.length}`
    );

    if (courses.length === 0 || rooms.length === 0) {
      throw new Error("No courses or rooms available");
    }

    let population = Array(POPULATION_SIZE)
      .fill()
      .map(() => generateRandomSchedule(courses, rooms));

    for (let generation = 0; generation < GENERATIONS; generation++) {
      population.forEach((schedule) => {
        schedule.fitness = calculateFitness(schedule, courses, rooms, users);
      });

      population.sort((a, b) => b.fitness - a.fitness);

      const newPopulation = [population[0], population[1]];

      while (newPopulation.length < POPULATION_SIZE) {
        const parent1 = selectParent(population);
        const parent2 = selectParent(population);
        let child = crossover(parent1, parent2);
        child = mutate(child, courses, rooms);
        newPopulation.push(child);
      }

      population = newPopulation;
    }

    population.forEach((schedule) => {
      schedule.fitness = calculateFitness(schedule, courses, rooms, users);
    });

    population.sort((a, b) => b.fitness - a.fitness);

    const bestSchedule = population[0];
    console.log("Best schedule fitness:", bestSchedule.fitness);
    console.log(
      "Best schedule timetable:",
      JSON.stringify(bestSchedule.timetable, null, 2)
    );

    const savedSchedule = new Schedule(bestSchedule);
    await savedSchedule.save();

    return savedSchedule;
  } catch (error) {
    console.error("Error in generateSchedule:", error);
    throw error;
  }
}

function generateRandomSchedule(courses, rooms) {
  const timetable = [];

  DAYS.forEach((day) => {
    TIME_SLOTS.forEach((timeSlot) => {
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

      timetable.push({
        course: randomCourse
          ? {
              _id: randomCourse._id,
              name: randomCourse.name,
              instructor: randomCourse.instructor
                ? {
                    _id: randomCourse.instructor._id,
                    name: randomCourse.instructor.name,
                  }
                : null,
            }
          : null,
        room: randomRoom
          ? {
              _id: randomRoom._id,
              name: randomRoom.name,
            }
          : null,
        day: day,
        startTime: timeSlot,
        endTime:
          TIME_SLOTS[
            Math.min(TIME_SLOTS.indexOf(timeSlot) + 1, TIME_SLOTS.length - 1)
          ],
      });
    });
  });

  return {
    courses: courses.map((course) => course._id),
    rooms: rooms.map((room) => room._id),
    timetable,
  };
}

function calculateFitness(schedule, courses, rooms, users) {
  let conflicts = 0;

  // Check for room and time conflicts
  for (let i = 0; i < schedule.timetable.length; i++) {
    for (let j = i + 1; j < schedule.timetable.length; j++) {
      if (
        schedule.timetable[i].course &&
        schedule.timetable[j].course &&
        schedule.timetable[i].day === schedule.timetable[j].day &&
        schedule.timetable[i].room &&
        schedule.timetable[j].room &&
        schedule.timetable[i].room._id.toString() ===
          schedule.timetable[j].room._id.toString() &&
        schedule.timetable[i].startTime === schedule.timetable[j].startTime
      ) {
        conflicts++;
      }
    }
  }

  // Check for instructor conflicts
  for (let i = 0; i < schedule.timetable.length; i++) {
    for (let j = i + 1; j < schedule.timetable.length; j++) {
      if (
        schedule.timetable[i].course &&
        schedule.timetable[j].course &&
        schedule.timetable[i].course.instructor &&
        schedule.timetable[j].course.instructor &&
        schedule.timetable[i].course.instructor._id.toString() ===
          schedule.timetable[j].course.instructor._id.toString() &&
        schedule.timetable[i].day === schedule.timetable[j].day &&
        schedule.timetable[i].startTime === schedule.timetable[j].startTime
      ) {
        conflicts++;
      }
    }
  }

  // Check for room capacity
  schedule.timetable.forEach((slot) => {
    if (slot.course && slot.room) {
      const course = courses.find(
        (c) => c._id.toString() === slot.course._id.toString()
      );
      const room = rooms.find(
        (r) => r._id.toString() === slot.room._id.toString()
      );
      if (room && course && room.capacity < course.capacity) {
        conflicts++;
      }
    }
  });

  // Penalize empty slots (this should not occur with proper implementation)
  schedule.timetable.forEach((slot) => {
    if (!slot.course) {
      conflicts += 10; // High penalty for empty slots
    }
  });

  return 1 / (conflicts + 1);
}

function selectParent(population) {
  const totalFitness = population.reduce(
    (sum, schedule) => sum + schedule.fitness,
    0
  );
  let randomValue = Math.random() * totalFitness;
  for (const schedule of population) {
    randomValue -= schedule.fitness;
    if (randomValue <= 0) {
      return schedule;
    }
  }
  return population[population.length - 1];
}

function crossover(parent1, parent2) {
  const childTimetable = parent1.timetable.map((slot, index) => {
    if (Math.random() < 0.5) {
      return { ...parent2.timetable[index] };
    }
    return { ...slot };
  });

  return {
    courses: parent1.courses,
    rooms: parent1.rooms,
    timetable: childTimetable,
  };
}

function mutate(schedule, courses, rooms) {
  if (!schedule || !schedule.timetable || !Array.isArray(schedule.timetable)) {
    console.error("Invalid schedule object in mutate function");
    return schedule;
  }

  const mutatedTimetable = schedule.timetable.map((slot) => {
    if (Math.random() < MUTATION_RATE) {
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

      return {
        course: randomCourse
          ? {
              _id: randomCourse._id,
              name: randomCourse.name,
              instructor: randomCourse.instructor
                ? {
                    _id: randomCourse.instructor._id,
                    name: randomCourse.instructor.name,
                  }
                : null,
            }
          : null,
        room: randomRoom
          ? {
              _id: randomRoom._id,
              name: randomRoom.name,
            }
          : null,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
    }
    return slot;
  });

  return {
    ...schedule,
    timetable: mutatedTimetable,
  };
}
