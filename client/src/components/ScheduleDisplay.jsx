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

function ScheduleDisplay({ schedule }) {
  console.log("Schedule data:", schedule);

  return (
    <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Generated Schedule
      </h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-indigo-100">
            <th className="border border-gray-300 px-4 py-2 text-indigo-800">
              Time
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="border border-gray-300 px-4 py-2 text-indigo-800"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((timeSlot) => (
            <tr key={timeSlot} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 font-bold text-indigo-600">
                {timeSlot}
              </td>
              {DAYS.map((day) => {
                const classSession = schedule.timetable.find(
                  (session) =>
                    session.day === day && session.startTime === timeSlot
                );
                return (
                  <td
                    key={`${day}-${timeSlot}`}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {classSession && classSession.course ? (
                      <div>
                        <p className="font-bold text-indigo-800">
                          {classSession.course.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {classSession.course.instructor
                            ? classSession.course.instructor.name
                            : "No instructor assigned"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {classSession.room
                            ? classSession.room.name
                            : "No room assigned"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <p className="font-bold">No Class</p>
                        <p>-</p>
                        <p>-</p>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleDisplay;
