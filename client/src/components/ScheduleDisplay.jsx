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
  if (!schedule || !schedule.timetable) {
    return <div className="text-center py-4">No schedule data available</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">
        Schedule for Year {schedule.year}, {schedule.branch}, Division{" "}
        {schedule.division}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Time</th>
              {DAYS.map((day) => (
                <th key={day} className="py-2 px-4 border">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((timeSlot) => (
              <tr key={timeSlot}>
                <td className="py-2 px-4 border font-medium">{timeSlot}</td>
                {DAYS.map((day) => {
                  const slot = schedule.timetable.find(
                    (s) => s.day === day && s.startTime === timeSlot
                  );
                  return (
                    <td
                      key={`${day}-${timeSlot}`}
                      className={`py-2 px-4 border ${
                        slot?.course?.lectureType === "lab" ? "bg-blue-50" : ""
                      }`}
                    >
                      {slot ? (
                        slot.isFree ? (
                          <p className="text-gray-400">Free Period</p>
                        ) : (
                          <div>
                            <p className="font-semibold">
                              {slot.course?.name || "Unnamed Course"}{" "}
                              <span className="text-xs font-normal text-gray-500">
                                ({slot.course?.code || "No Code"})
                              </span>
                            </p>
                            <p className="text-sm">
                              {slot.course?.instructor?.name || "No Instructor"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {slot.room?.name || "No Room"}
                            </p>
                            {slot.course?.lectureType === "lab" && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                                {slot.isLabFirst
                                  ? "Lab (First Hour)"
                                  : slot.isLabSecond
                                  ? "Lab (Second Hour)"
                                  : "Lab"}
                              </span>
                            )}
                            {slot.course?.lectureType === "theory" && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                                Theory
                              </span>
                            )}
                          </div>
                        )
                      ) : (
                        <p className="text-gray-400">No class scheduled</p>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ScheduleDisplay;
