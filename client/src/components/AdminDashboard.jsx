import { useState, useEffect } from "react";
import axios from "axios";
import CourseForm from "./CourseForm";
import RoomForm from "./RoomForm";
import Registration from "./Registration";
import AdminRegistration from "./AdminRegistration";
import ScheduleDisplay from "./ScheduleDisplay";
import TimetableManager from "./TimetableManager";
import TimetableEditor from "./TimetableEditor";
import { logout, getCurrentUser } from "../utils/auth";

const API_URL = "https://edusync-backend-gvgh.onrender.com/api/schedule";

const YEARS = [1, 2, 3, 4];
const BRANCHES = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Chemical Engineering",
];
const DIVISIONS = ["A", "B"];

// Add a new component for handling manual schedule changes
function ManualScheduleChange({ notification, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [changes, setChanges] = useState([
    {
      day: notification.data.day,
      timeSlot: notification.data.timeSlot,
      courseId: "",
      roomId: "",
    },
  ]);

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
    fetchRooms();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_URL}/timetables`);
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Error fetching schedules. Please try again.");
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

  const handleChangeUpdate = (index, field, value) => {
    const updatedChanges = [...changes];
    updatedChanges[index][field] = value;
    setChanges(updatedChanges);
  };

  const handleAddChange = () => {
    setChanges([
      ...changes,
      { day: "Monday", timeSlot: "09:00", courseId: "", roomId: "" },
    ]);
  };

  const handleRemoveChange = (index) => {
    const updatedChanges = [...changes];
    updatedChanges.splice(index, 1);
    setChanges(updatedChanges);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate inputs
      if (!selectedSchedule) {
        setError("Please select a schedule to modify");
        setLoading(false);
        return;
      }

      for (const change of changes) {
        if (!change.courseId || !change.roomId) {
          setError("Please select a course and room for each change");
          setLoading(false);
          return;
        }
      }

      // Submit the changes
      const response = await axios.post(`${API_URL}/manual-schedule-change`, {
        scheduleId: selectedSchedule,
        changes,
      });

      setSuccess("Schedule updated successfully");

      // Update the notification status
      await axios.post(`${API_URL}/notifications/${notification._id}/approve`);

      // Notify the parent component
      onSuccess();
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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">
          Manual Schedule Change
        </h2>
        <p className="mb-4">
          <strong>Teacher:</strong> {notification.data.teacherName}
          <br />
          <strong>Request:</strong> Change schedule for {notification.data.day}{" "}
          at {notification.data.timeSlot}
          <br />
          <strong>Reason:</strong> {notification.data.reason}
        </p>

        {error && <p className="text-red-500 text-sm italic mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm italic mb-4">{success}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="schedule"
            >
              Select Schedule to Modify
            </label>
            <select
              id="schedule"
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
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

          <h3 className="text-lg font-semibold mb-2">Schedule Changes</h3>

          {changes.map((change, index) => (
            <div
              key={index}
              className="mb-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Day
                  </label>
                  <select
                    value={change.day}
                    onChange={(e) =>
                      handleChangeUpdate(index, "day", e.target.value)
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                    ].map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Time Slot
                  </label>
                  <select
                    value={change.timeSlot}
                    onChange={(e) =>
                      handleChangeUpdate(index, "timeSlot", e.target.value)
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    {[
                      "09:00",
                      "10:00",
                      "11:00",
                      "12:00",
                      "13:00",
                      "14:00",
                      "15:00",
                      "16:00",
                    ].map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Course
                  </label>
                  <select
                    value={change.courseId}
                    onChange={(e) =>
                      handleChangeUpdate(index, "courseId", e.target.value)
                    }
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
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Room
                  </label>
                  <select
                    value={change.roomId}
                    onChange={(e) =>
                      handleChangeUpdate(index, "roomId", e.target.value)
                    }
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

              {changes.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveChange(index)}
                  className="mt-2 text-red-500 hover:text-red-700"
                >
                  Remove this change
                </button>
              )}
            </div>
          ))}

          <div className="mb-4">
            <button
              type="button"
              onClick={handleAddChange}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              + Add Another Change
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Processing..." : "Apply Changes"}
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Update the notification handling in AdminDashboard
function AdminDashboard() {
  const user = getCurrentUser();

  const [activeTab, setActiveTab] = useState("schedule"); // "schedule" or "timetables"
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showAdminRegistration, setShowAdminRegistration] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedDivision, setSelectedDivision] = useState(DIVISIONS[0]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [showManualScheduleChange, setShowManualScheduleChange] =
    useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (activeTab === "schedule") {
      fetchCourses();
      fetchRooms();
      fetchNotifications();
    }
  }, [activeTab, selectedYear, selectedBranch, selectedDivision]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`, {
        params: {
          year: selectedYear,
          branch: selectedBranch,
          division: selectedDivision,
        },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setErrorMessage("Error fetching courses. Please try again later.");
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setErrorMessage("Error fetching rooms. Please try again later.");
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const addCourse = async (course) => {
    try {
      console.log("Adding course:", course);
      const response = await axios.post(`${API_URL}/courses`, {
        ...course,
        year: selectedYear,
        branch: selectedBranch,
        division: selectedDivision,
      });
      console.log("Course added successfully:", response.data);
      fetchCourses();
      return response.data;
    } catch (error) {
      console.error("Error adding course:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error adding course. Please try again.";
      setErrorMessage(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const addRoom = async (room) => {
    try {
      await axios.post(`${API_URL}/rooms`, room);
      fetchRooms();
    } catch (error) {
      console.error("Error adding room:", error);
      setErrorMessage("Error adding room. Please try again.");
    }
  };

  const generateSchedule = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.post(`${API_URL}/generate`, {
        year: selectedYear,
        branch: selectedBranch,
        division: selectedDivision,
      });
      setCurrentSchedule(response.data);
      setShowSchedule(true);
    } catch (error) {
      console.error("Error generating schedule:", error);
      setErrorMessage(
        "Error generating schedule. Please ensure you have added courses and rooms, then try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationClose = (message) => {
    setShowRegistration(false);
    setShowAdminRegistration(false);
    if (message) {
      setRegistrationMessage(message);
      setTimeout(() => setRegistrationMessage(""), 5000);
    }
  };

  const handleNotificationAction = async (notification, action) => {
    try {
      if (
        notification.type === "SCHEDULE_CHANGE_REQUEST" &&
        action === "approve"
      ) {
        // Show the manual schedule change interface
        setSelectedNotification(notification);
        setShowManualScheduleChange(true);
      } else {
        // Handle other notification types normally
        await axios.post(
          `${API_URL}/notifications/${notification._id}/${action}`
        );
        fetchNotifications();
      }
    } catch (error) {
      console.error(`Error ${action}ing notification:`, error);
      setErrorMessage(`Error ${action}ing notification. Please try again.`);
    }
  };

  const handleScheduleChangeSuccess = () => {
    setShowManualScheduleChange(false);
    setSelectedNotification(null);
    fetchNotifications();
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: "url('/background5.jpg')",
        backgroundSize: "cover",
      }}
    >
      <nav className="bg-indigo-600 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-serif text-white">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              >
                Add User
              </button>
              <button
                onClick={() => setShowAdminRegistration(true)}
                className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              >
                Add Admin
              </button>
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
              onClick={() => setActiveTab("schedule")}
              className={`${
                activeTab === "schedule"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-700 hover:text-gray-800 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Schedule Generator
            </button>
            <button
              onClick={() => setActiveTab("timetables")}
              className={`${
                activeTab === "timetables"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Timetable Manager
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`${
                activeTab === "editor"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Timetable Editor
            </button>
          </nav>
        </div>

        {registrationMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{registrationMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        {activeTab === "schedule" && (
          <>
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Notifications</h2>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border rounded-lg p-4 mb-4 ${
                      notification.type === "SCHEDULE_CHANGE_REQUEST"
                        ? "bg-blue-50 border-blue-200"
                        : notification.type === "TEACHER_ABSENCE"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() =>
                          handleNotificationAction(notification, "approve")
                        }
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                      >
                        {notification.type === "SCHEDULE_CHANGE_REQUEST"
                          ? "Manage Change"
                          : "Approve"}
                      </button>
                      <button
                        onClick={() =>
                          handleNotificationAction(notification, "reject")
                        }
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showSchedule ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">
                    Select Year, Branch, and Division
                  </h2>
                  <div className="flex space-x-4">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    >
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    >
                      {BRANCHES.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    >
                      {DIVISIONS.map((division) => (
                        <option key={division} value={division}>
                          Division {division}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <CourseForm addCourse={addCourse} />
                  <RoomForm addRoom={addRoom} />
                </div>

                <div className="text-center mb-8">
                  <button
                    onClick={generateSchedule}
                    disabled={isLoading}
                    className={`bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Generating..." : "Generate Schedule"}
                  </button>
                </div>
                {showRegistration && (
                  <Registration
                    onClose={handleRegistrationClose}
                    administratorId={user.id}
                  />
                )}
                {showAdminRegistration && (
                  <AdminRegistration
                    onClose={handleRegistrationClose}
                    administratorId={user.id}
                  />
                )}
              </>
            ) : (
              <div className="mb-8">
                <button
                  onClick={() => setShowSchedule(false)}
                  className="mb-4 bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                >
                  Back to Dashboard
                </button>
                <ScheduleDisplay schedule={currentSchedule} />
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={async () => {
                  try {
                    const response = await axios.post(
                      `${API_URL}/resolve-conflicts`,
                      {
                        year: selectedYear,
                        branch: selectedBranch,
                        division: selectedDivision,
                      }
                    );
                    setCurrentSchedule(response.data);
                    setShowSchedule(true);
                  } catch (error) {
                    console.error("Error resolving conflicts:", error);
                    setErrorMessage(
                      "Error resolving conflicts. Please try again."
                    );
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Resolve Conflicts
              </button>
            </div>
          </>
        )}

        {activeTab === "timetables" && <TimetableManager />}

        {activeTab === "editor" && <TimetableEditor />}
      </div>
      {showManualScheduleChange && selectedNotification && (
        <ManualScheduleChange
          notification={selectedNotification}
          onClose={() => setShowManualScheduleChange(false)}
          onSuccess={handleScheduleChangeSuccess}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
