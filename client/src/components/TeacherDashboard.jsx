import { useState, useEffect } from "react";
import axios from "axios";
import { logout, getCurrentUser } from "../utils/auth";

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

function TeacherDashboard() {
  const user = getCurrentUser();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("schedules");
  const [dataFetched, setDataFetched] = useState(false); // Flag to prevent infinite fetching

  // For absence reporting
  const [absenceData, setAbsenceData] = useState({
    date: "",
    reason: "",
  });

  // For schedule change request
  const [showScheduleChangeForm, setShowScheduleChangeForm] = useState(false);
  const [scheduleChangeData, setScheduleChangeData] = useState({
    day: DAYS[0],
    timeSlot: TIME_SLOTS[0].value,
    reason: "",
  });

  useEffect(() => {
    // Only fetch data if we haven't already and user exists
    if (user && !dataFetched) {
      setDataFetched(true); // Set flag to prevent repeated fetching
      fetchData();
    }
  }, [user, dataFetched]);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // Use Promise.all to fetch all data in parallel
      const [teacherResponse, coursesResponse, schedulesResponse] =
        await Promise.all([
          axios.get(`${API_URL}/teachers/${user.id}`),
          axios.get(`${API_URL}/teacher-courses/${user.id}`),
          axios.get(`${API_URL}/teacher-schedules/${user.id}`),
        ]);

      setTeacherData(teacherResponse.data);
      setCourses(coursesResponse.data);
      setSchedules(schedulesResponse.data);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setError("Error fetching your data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbsenceChange = (e) => {
    const { name, value } = e.target;
    setAbsenceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_URL}/teacher-absence`, {
        teacherId: user.id,
        ...absenceData,
      });
      setSuccess("Absence reported successfully!");
      setAbsenceData({
        date: "",
        reason: "",
      });
    } catch (error) {
      console.error("Error reporting absence:", error);
      setError("Error reporting absence. Please try again.");
    }
  };

  const handleScheduleChangeDataChange = (e) => {
    const { name, value } = e.target;
    setScheduleChangeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScheduleChangeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_URL}/schedule-change-request`, {
        teacherId: user.id,
        teacherName: user.name,
        ...scheduleChangeData,
      });
      setSuccess("Schedule change request submitted successfully!");
      setShowScheduleChangeForm(false);
      setScheduleChangeData({
        day: DAYS[0],
        timeSlot: TIME_SLOTS[0].value,
        reason: "",
      });
    } catch (error) {
      console.error("Error submitting schedule change request:", error);
      setError("Error submitting request. Please try again.");
    }
  };

  // Retry data fetching if there was an error
  const handleRetryFetch = () => {
    setDataFetched(false); // Reset the flag to allow fetching again
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
      className="min-h-screen bg-gray-100"
      style={{
        backgroundImage: "url('/background5.jpg')",
        backgroundSize: "cover",
      }}
    >
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-serif text-white">Teacher Dashboard</h1>
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
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
            <button
              onClick={handleRetryFetch}
              className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("absence")}
              className={`${
                activeTab === "absence"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Report Absence
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`${
                activeTab === "courses"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`${
                activeTab === "schedules"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Schedules
            </button>
          </nav>
        </div>

        {activeTab === "absence" && (
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
              Report Absence
            </h2>
            {error && (
              <p className="text-red-500 text-sm italic mb-4">{error}</p>
            )}
            {success && (
              <p className="text-green-500 text-sm italic mb-4">{success}</p>
            )}

            <form onSubmit={handleAbsenceSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="date"
                >
                  Date of Absence
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={absenceData.date}
                  onChange={handleAbsenceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="reason"
                >
                  Reason for Absence
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={absenceData.reason}
                  onChange={handleAbsenceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                  type="submit"
                >
                  Submit Absence Report
                </button>
              </div>
            </form>

            <div className="mt-8">
              <button
                onClick={() => setShowScheduleChangeForm(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              >
                Request Schedule Change
              </button>
            </div>

            {showScheduleChangeForm && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-indigo-600">
                  Request Schedule Change
                </h3>

                <form onSubmit={handleScheduleChangeSubmit}>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="day"
                    >
                      Day
                    </label>
                    <select
                      id="day"
                      name="day"
                      value={scheduleChangeData.day}
                      onChange={handleScheduleChangeDataChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="timeSlot"
                    >
                      Time Slot
                    </label>
                    <select
                      id="timeSlot"
                      name="timeSlot"
                      value={scheduleChangeData.timeSlot}
                      onChange={handleScheduleChangeDataChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="changeReason"
                    >
                      Reason for Schedule Change
                    </label>
                    <textarea
                      id="changeReason"
                      name="reason"
                      value={scheduleChangeData.reason}
                      onChange={handleScheduleChangeDataChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                      required
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                      type="submit"
                    >
                      Submit Request
                    </button>
                    <button
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                      type="button"
                      onClick={() => setShowScheduleChangeForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
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
                                        ? slot.course?.lectureType === "lab"
                                          ? "bg-blue-50"
                                          : ""
                                        : "bg-gray-50"
                                    }`}
                                  >
                                    {slot ? (
                                      <div>
                                        <p className="font-semibold">
                                          {slot.course?.name ||
                                            "Unnamed Course"}
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
