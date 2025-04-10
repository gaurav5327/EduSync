import { useState, useEffect } from "react";
import axios from "axios";
import CourseForm from "./CourseForm";
import RoomForm from "./RoomForm";
import Registration from "./Registration";
import AdminRegistration from "./AdminRegistration";
import ScheduleDisplay from "./ScheduleDisplay";
import TimetableManager from "./TimetableManager";
import { logout, getCurrentUser } from "../utils/auth";

const API_URL = "http://localhost:3000/api/schedule";

const YEARS = [1, 2, 3, 4];
const BRANCHES = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];
const DIVISIONS = ["A", "B", "C"];

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

  const handleViewSchedule = async () => {
    try {
      const response = await axios.get(`${API_URL}/latest`, {
        params: {
          year: selectedYear,
          branch: selectedBranch,
          division: selectedDivision,
        },
      });
      setCurrentSchedule(response.data);
      setShowSchedule(true);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setErrorMessage("Error fetching schedule. Please try again later.");
    }
  };

  const handleNotificationAction = async (notificationId, action) => {
    try {
      await axios.post(`${API_URL}/notifications/${notificationId}/${action}`);
      fetchNotifications();
      if (action === "approve") {
        // Trigger schedule update
        await generateSchedule();
      }
    } catch (error) {
      console.error(`Error ${action}ing notification:`, error);
      setErrorMessage(`Error ${action}ing notification. Please try again.`);
    }
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
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
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
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Schedule Generator
            </button>
            <button
              onClick={() => setActiveTab("timetables")}
              className={`${
                activeTab === "timetables"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Timetable Manager
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
                    className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-2"
                  >
                    <p>{notification.message}</p>
                    <div className="mt-2">
                      <button
                        onClick={() =>
                          handleNotificationAction(notification._id, "approve")
                        }
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleNotificationAction(notification._id, "reject")
                        }
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
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
                <div className="text-center mb-8">
                  <button
                    onClick={handleViewSchedule}
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                  >
                    View Schedule
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
      </div>
    </div>
  );
}

export default AdminDashboard;
