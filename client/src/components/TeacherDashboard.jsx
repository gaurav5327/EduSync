import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import AvailabilityForm from "./AvailabilityForm";
import PreferencesForm from "./PreferencesForm";
import ScheduleDisplay from "./ScheduleDisplay";

const API_URL = "http://localhost:3000/api";
const SOCKET_URL = "http://localhost:3000";

function TeacherDashboard({ user, onLogout }) {
  const [schedule, setSchedule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("scheduleUpdate", handleScheduleUpdate);

    fetchLatestSchedule();
    fetchCourses();

    return () => newSocket.close();
  }, []);

  const handleScheduleUpdate = (update) => {
    if (update.type === "availability" || update.type === "preference") {
      fetchLatestSchedule();
    }
  };

  const fetchLatestSchedule = async () => {
    try {
      const response = await axios.get(`${API_URL}/schedule/latest`);
      setSchedule(response.data);
    } catch (error) {
      console.error("Error fetching latest schedule:", error);
      setError("Failed to fetch the latest schedule. Please try again later.");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/schedule/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses. Please try again later.");
    }
  };

  const updateAvailability = async (availability) => {
    try {
      await axios.patch(`${API_URL}/users/availability`, { availability });
      socket.emit("availabilityUpdate", { userId: user.id, availability });
      setError("");
    } catch (error) {
      console.error("Error updating availability:", error);
      setError("Failed to update availability. Please try again later.");
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      await axios.patch(`${API_URL}/users/preferences`, { preferences });
      socket.emit("preferenceUpdate", { userId: user.id, preferences });
      setError("");
    } catch (error) {
      console.error("Error updating preferences:", error);
      setError("Failed to update preferences. Please try again later.");
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600">
            Teacher Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <AvailabilityForm
            onSubmit={updateAvailability}
            initialAvailability={user.availability}
          />
          <PreferencesForm
            onSubmit={updatePreferences}
            courses={courses}
            initialPreferences={user.preferences}
          />
        </div>
        {schedule && <ScheduleDisplay schedule={schedule} />}
      </div>
    </div>
  );
}

export default TeacherDashboard;
