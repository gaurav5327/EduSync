import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://edusync-backend-gvgh.onrender.com/api/schedule";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
];

function TimetableEditor() {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotData, setSlotData] = useState({
    courseId: "",
    roomId: "",
  });

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      fetchScheduleDetails(selectedSchedule);
    } else {
      setCurrentSchedule(null);
    }
  }, [selectedSchedule]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_URL}/timetables`);
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Error fetching schedules. Please try again.");
    }
  };

  const fetchScheduleDetails = async (scheduleId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/timetables/${scheduleId}`);
      setCurrentSchedule(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      setError("Error fetching schedule details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses-all`);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Error fetching courses. Please try again.");
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Error fetching rooms. Please try again.");
    }
  };

  const handleSlotClick = (day, timeSlot) => {
    if (!editMode) return;

    // Find if there's an existing slot
    const existingSlot = currentSchedule.timetable.find(
      (slot) => slot.day === day && slot.startTime === timeSlot
    );

    setSelectedSlot({ day, timeSlot });
    setSlotData({
      courseId: existingSlot?.course?._id || "",
      roomId: existingSlot?.room?._id || "",
    });
  };

  const handleSlotDataChange = (e) => {
    const { name, value } = e.target;
    setSlotData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSlot = async () => {
    if (!selectedSlot || !slotData.courseId || !slotData.roomId) {
      setError("Please select a course and room");
      return;
    }

    setLoading(true);
    try {
      // Prepare the changes array for the API
      const changes = [
        {
          day: selectedSlot.day,
          timeSlot: selectedSlot.timeSlot,
          courseId: slotData.courseId,
          roomId: slotData.roomId,
        },
      ];

      // Call the API to update the schedule
      await axios.post(`${API_URL}/manual-schedule-change`, {
        scheduleId: selectedSchedule,
        changes,
      });

      // Refresh the schedule
      await fetchScheduleDetails(selectedSchedule);
      setSuccess("Schedule updated successfully");
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error updating schedule:", error);
      if (error.response?.data?.conflicts) {
        setError(
          `Error: ${
            error.response.data.message
          }. Conflicts detected: ${error.response.data.conflicts
            .map((c) => c.message)
            .join(", ")}`
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Error updating schedule. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedSlot(null);
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    if (selectedSlot) {
      setSelectedSlot(null);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Timetable Editor
      </h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="mb-6">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="schedule"
        >
          Select Schedule to Edit
        </label>
        <select
          id="schedule"
          value={selectedSchedule}
          onChange={(e) => setSelectedSchedule(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Select a schedule</option>
          {schedules.map((schedule) => (
            <option key={schedule._id} value={schedule._id}>
              Year {schedule.year} - {schedule.branch} - Division{" "}
              {schedule.division}
            </option>
          ))}
        </select>
      </div>

      {selectedSchedule && (
        <div className="mb-4">
          <button
            onClick={handleToggleEditMode}
            className={`${
              editMode ? "bg-gray-500" : "bg-indigo-500"
            } hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4`}
          >
            {editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          </button>
          {editMode && (
            <p className="text-sm text-indigo-600 mb-4">
              Click on any cell in the timetable to edit that time slot
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading timetable...</p>
        </div>
      ) : currentSchedule ? (
        <div>
          <h3 className="text-xl font-semibold mb-2">
            Year {currentSchedule.year} - {currentSchedule.branch} - Division{" "}
            {currentSchedule.division}
          </h3>
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
                  <tr key={timeSlot.value}>
                    <td className="py-2 px-4 border font-medium">
                      {timeSlot.label}
                    </td>
                    {DAYS.map((day) => {
                      const slot = currentSchedule.timetable.find(
                        (s) => s.day === day && s.startTime === timeSlot.value
                      );
                      const isSelected =
                        selectedSlot &&
                        selectedSlot.day === day &&
                        selectedSlot.timeSlot === timeSlot.value;

                      return (
                        <td
                          key={`${day}-${timeSlot.value}`}
                          className={`py-2 px-4 border ${
                            slot
                              ? slot.course?.lectureType === "lab"
                                ? "bg-blue-50"
                                : ""
                              : "bg-gray-50"
                          } ${isSelected ? "ring-2 ring-indigo-500" : ""} ${
                            editMode ? "cursor-pointer hover:bg-gray-100" : ""
                          }`}
                          onClick={() => handleSlotClick(day, timeSlot.value)}
                        >
                          {slot ? (
                            <div>
                              <p className="font-semibold">
                                {slot.course?.name || "Unnamed Course"}
                              </p>
                              <p className="text-sm">
                                {slot.course?.instructor?.name ||
                                  "No Instructor"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {slot.room?.name || "No Room"}
                              </p>
                              {slot.course?.lectureType === "lab" && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                                  Lab
                                </span>
                              )}
                            </div>
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

          {selectedSlot && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                Edit Slot: {selectedSlot.day} at {selectedSlot.timeSlot}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="courseId"
                  >
                    Course
                  </label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={slotData.courseId}
                    onChange={handleSlotDataChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code}) - {course.lectureType}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="roomId"
                  >
                    Room
                  </label>
                  <select
                    id="roomId"
                    name="roomId"
                    value={slotData.roomId}
                    onChange={handleSlotDataChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select a room</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.name} ({room.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSlot}
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select a schedule to view and edit.</p>
        </div>
      )}
    </div>
  );
}

export default TimetableEditor;
