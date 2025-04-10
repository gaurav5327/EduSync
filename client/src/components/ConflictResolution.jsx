import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

function ConflictResolution() {
  const [conflicts, setConflicts] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConflicts();
    fetchRooms();
  }, []);

  const fetchConflicts = async () => {
    try {
      const response = await axios.get(`${API_URL}/schedule/conflicts`);
      setConflicts(response.data.conflicts);
      setSchedule(response.data.schedule);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch conflicts");
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/schedule/rooms`);
      setRooms(response.data);
    } catch (error) {
      setError("Failed to fetch rooms");
    }
  };

  const handleResolveConflict = async (conflictId, resolution) => {
    try {
      await axios.post(`${API_URL}/schedule/resolve-conflict`, {
        conflictId,
        resolution,
      });
      fetchConflicts();
    } catch (error) {
      setError("Failed to resolve conflict");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
      }}
    >
      <h1 className="text-3xl font-bold mb-4">Conflict Resolution</h1>
      {conflicts.map((conflict) => (
        <div
          key={conflict._id}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <h2 className="text-xl font-bold mb-2">
            {conflict.type === "room" ? "Room Conflict" : "Instructor Conflict"}
          </h2>
          <p>Day: {conflict.day}</p>
          <p>Time: {conflict.startTime}</p>
          <p>Courses: {conflict.courses.map((c) => c.name).join(", ")}</p>
          {conflict.type === "room" && (
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select new room:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                onChange={(e) =>
                  handleResolveConflict(conflict._id, {
                    type: "changeRoom",
                    roomId: e.target.value,
                  })
                }
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.name} (Capacity: {room.capacity})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Reschedule:
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={(e) =>
                handleResolveConflict(conflict._id, {
                  type: "reschedule",
                  slot: e.target.value,
                })
              }
            >
              <option value="">Select a new time slot</option>
              {schedule.availableSlots.map((slot) => (
                <option
                  key={`${slot.day}-${slot.startTime}`}
                  value={JSON.stringify(slot)}
                >
                  {slot.day} - {slot.startTime}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConflictResolution;
