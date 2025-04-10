import { useState } from "react";

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

function AvailabilityForm({ onSubmit, initialAvailability }) {
  const [availability, setAvailability] = useState(initialAvailability || []);

  const handleChange = (day, timeSlot) => {
    const updatedAvailability = [...availability];
    const dayIndex = updatedAvailability.findIndex((a) => a.day === day);

    if (dayIndex === -1) {
      updatedAvailability.push({ day, timeSlots: [timeSlot] });
    } else {
      const timeSlots = updatedAvailability[dayIndex].timeSlots;
      const timeSlotIndex = timeSlots.indexOf(timeSlot);

      if (timeSlotIndex === -1) {
        timeSlots.push(timeSlot);
      } else {
        timeSlots.splice(timeSlotIndex, 1);
      }

      if (timeSlots.length === 0) {
        updatedAvailability.splice(dayIndex, 1);
      }
    }

    setAvailability(updatedAvailability);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(availability);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 className="text-2xl font-bold mb-4">Update Availability</h2>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th></th>
            {TIME_SLOTS.map((slot) => (
              <th key={slot} className="px-2 py-1">
                {slot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day}>
              <td className="font-bold">{day}</td>
              {TIME_SLOTS.map((slot) => (
                <td key={`${day}-${slot}`} className="text-center">
                  <input
                    type="checkbox"
                    checked={availability.some(
                      (a) => a.day === day && a.timeSlots.includes(slot)
                    )}
                    onChange={() => handleChange(day, slot)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Update Availability
      </button>
    </form>
  );
}

export default AvailabilityForm;
