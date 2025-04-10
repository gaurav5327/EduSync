import { useState, useEffect } from "react";
import axios from "axios";
import { logout, getCurrentUser } from "../utils/auth";

const API_URL = "http://localhost:3000/api/schedule";

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

function TeacherDashboard() {
  const user = getCurrentUser();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("availability");

  useEffect(() => {
    if (user) {
      fetchTeacherData();
      fetchTeacherCourses();
      fetchTeacherSchedules();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers/${user.id}`);
      setTeacherData(response.data);

      // Initialize availability with teacher's current availability or empty object
      const teacherAvailability = response.data.availability || {};
      setAvailability(teacherAvailability);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setError("Error fetching your data. Please try again later.");
      setLoading(false);
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/teacher-courses/${user.id}`);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
    }
  };

  const fetchTeacherSchedules = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/teacher-schedules/${user.id}`
      );
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching teacher schedules:", error);
    }
  };

  const handleAvailabilityChange = (day, timeSlot) => {
    setAvailability((prev) => {
      // Create a deep copy to avoid mutation issues
      const newAvailability = { ...prev };

      // Initialize the day if it doesn't exist
      if (!newAvailability[day]) {
        newAvailability[day] = {};
      }

      // Toggle the availability for this time slot
      newAvailability[day][timeSlot] = !newAvailability[day]?.[timeSlot];

      return newAvailability;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/teacher-availability`, {
        teacherId: user.id,
        availability,
      });
      setSuccess("Availability update request sent successfully!");
      setError("");
    } catch (error) {
      console.error("Error updating availability:", error);
      setError("Error updating availability. Please try again.");
      setSuccess("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading teacher data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/background3.jpg')",
        backgroundSize: "cover",
      }}
    >
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
            <div className="flex items-center">
              <span className="text-white mr-4">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("availability")}
              className={`${
                activeTab === "availability"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Update Availability
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`${
                activeTab === "courses"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`${
                activeTab === "schedules"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Schedules
            </button>
          </nav>
        </div>

        {activeTab === "availability" && (
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
              Update Availability
            </h2>
            <form onSubmit={handleSubmit}>
              {DAYS.map((day) => (
                <div key={day} className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{day}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <label
                        key={slot.value}
                        className="inline-flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={!!availability[day]?.[slot.value]}
                          onChange={() =>
                            handleAvailabilityChange(day, slot.value)
                          }
                          className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-gray-700">{slot.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {error && (
                <p className="text-red-500 text-xs italic mb-4">{error}</p>
              )}
              {success && (
                <p className="text-green-500 text-xs italic mb-4">{success}</p>
              )}
              <div className="flex items-center justify-between">
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                  type="submit"
                >
                  Update Availability
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
              My Courses
            </h2>
            {courses.length === 0 ? (
              <p className="text-gray-500">
                You are not assigned to any courses yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Division
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {course.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Year {course.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {course.branch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Division {course.division}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              course.lectureType === "lab"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {course.lectureType === "lab" ? "Lab" : "Theory"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "schedules" && (
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
              My Schedules
            </h2>
            {schedules.length === 0 ? (
              <p className="text-gray-500">
                No schedules available for your courses yet.
              </p>
            ) : (
              <div className="space-y-8">
                {schedules.map((schedule) => (
                  <div key={schedule._id} className="border rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-2">
                      Year {schedule.year} - {schedule.branch} - Division{" "}
                      {schedule.division}
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
                                const slot = schedule.timetable.find(
                                  (s) =>
                                    s.day === day &&
                                    s.startTime === timeSlot.value &&
                                    s.course?.instructor?._id === user.id
                                );
                                return (
                                  <td
                                    key={`${day}-${timeSlot.value}`}
                                    className={`py-2 px-4 border ${
                                      slot
                                        ? slot.course.lectureType === "lab"
                                          ? "bg-blue-50"
                                          : ""
                                        : "bg-gray-50"
                                    }`}
                                  >
                                    {slot ? (
                                      <div>
                                        <p className="font-semibold">
                                          {slot.course.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {slot.room.name}
                                        </p>
                                        {slot.course.lectureType === "lab" && (
                                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                                            Lab
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-gray-400">-</p>
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
