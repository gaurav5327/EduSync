class CSPSolver {
  constructor(variables, domains, constraints) {
    this.variables = variables
    this.domains = domains
    this.constraints = constraints
  }

  solve() {
    return this.backtrack({})
  }

  backtrack(assignment) {
    if (Object.keys(assignment).length === this.variables.length) {
      return assignment
    }

    const unassigned = this.variables.find((v) => !(v in assignment))

    for (const value of this.domains[unassigned]) {
      const newAssignment = { ...assignment, [unassigned]: value }
      if (this.isConsistent(newAssignment)) {
        const result = this.backtrack(newAssignment)
        if (result !== null) {
          return result
        }
      }
    }

    return null
  }

  isConsistent(assignment) {
    return this.constraints.every((constraint) => constraint(assignment))
  }
}

export function solveScheduleCSP(schedule, conflicts) {
  const variables = conflicts.map((conflict) => conflict._id)
  const domains = {}
  const constraints = []

  for (const conflict of conflicts) {
    if (conflict.type === "room") {
      domains[conflict._id] = schedule.rooms.map((room) => ({ type: "room", value: room._id }))
    } else {
      domains[conflict._id] = schedule.availableSlots.map((slot) => ({ type: "reschedule", value: slot }))
    }
  }

  // Add constraints
  constraints.push((assignment) => {
    const usedRooms = new Set()
    const usedSlots = new Set()

    for (const [conflictId, resolution] of Object.entries(assignment)) {
      if (resolution.type === "room") {
        if (usedRooms.has(resolution.value)) return false
        usedRooms.add(resolution.value)
      } else {
        const slotKey = `${resolution.value.day}-${resolution.value.startTime}`
        if (usedSlots.has(slotKey)) return false
        usedSlots.add(slotKey)
      }
    }

    return true
  })

  const solver = new CSPSolver(variables, domains, constraints)
  return solver.solve()
}

