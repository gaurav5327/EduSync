import { useState, useEffect } from "react";
import axios from "axios";
import CourseForm from "./CourseForm";
import RoomForm from "./RoomForm";
import ScheduleDisplay from "./ScheduleDisplay";
import Registration from "./Registration";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:3000/api/schedule";

function AdminDashboard({ user, onLogout }) {
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showAdminRegistration, setShowAdminRegistration] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchRooms();
    fetchLatestSchedule();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
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

  const fetchLatestSchedule = async () => {
    try {
      const response = await axios.get(`${API_URL}/latest`);
      console.log("Fetched schedule:", response.data);
      setSchedule(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching latest schedule:", error);
      if (error.response && error.response.status === 404) {
        setErrorMessage(
          "No schedules found. Please generate a schedule first."
        );
      } else {
        setErrorMessage(
          "Error fetching the latest schedule. Please try again later."
        );
      }
    }
  };

  const addCourse = async (course) => {
    try {
      await axios.post(`${API_URL}/courses`, course);
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      setErrorMessage("Error adding course. Please try again.");
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
      const response = await axios.post(`${API_URL}/generate`);
      console.log("Generated schedule:", response.data);
      setSchedule(response.data);
      setErrorMessage("");
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

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <nav className="bg-indigo-600 shadow-lg w-full">
        <div className="w-full px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-white text-black font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 outline-none"
              >
                Add User
              </button>
              <button
                onClick={() => setShowAdminRegistration(true)}
                className="bg-white text-black font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              >
                Add Admin
              </button>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full mx-auto py-6 sm:px-6 lg:px-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <CourseForm addCourse={addCourse} />
          <RoomForm addRoom={addRoom} />
        </div>
        <div className="text-center mb-8">
          <button
            onClick={generateSchedule}
            disabled={isLoading}
            className={`bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Generating..." : "Generate Schedule"}
          </button>
        </div>
        {schedule && <ScheduleDisplay schedule={schedule} />}
        {showRegistration && (
          <Registration
            onClose={handleRegistrationClose}
            administratorId={user.id}
          />
        )}
        {showAdminRegistration && (
          <Registration
            onClose={handleRegistrationClose}
            administratorId={user.id}
            isAdminRegistration={true}
          />
        )}
        <div className="mt-8">
          <Link
            to="/conflict-resolution"
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Resolve Conflicts
          </Link>
        </div>
      </div>
    </div>
  );
  }
  
  export default AdminDashboard;
