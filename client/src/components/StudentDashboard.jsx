import { useState, useEffect } from "react";
import axios from "axios";
import AvailabilityForm from "./AvailabilityForm";
import ScheduleDisplay from "./ScheduleDisplay";

const API_URL = "http://localhost:3000/api/schedule";

function StudentDashboard({ user, onLogout }) {
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    fetchLatestSchedule();
  }, []);

  const fetchLatestSchedule = async () => {
    try {
      const response = await axios.get(`${API_URL}/latest`);
      setSchedule(response.data);
    } catch (error) {
      console.error("Error fetching latest schedule:", error);
    }
  };

  const updateAvailability = async (availability) => {
    try {
      await axios.patch(`${API_URL}/availability`, { availability });
      // You might want to update the user state or refetch the schedule here
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl text-blue-700 font-bold">
            Student Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
        <div className="mb-8">
          <AvailabilityForm
            onSubmit={updateAvailability}
            initialAvailability={user.availability}
          />
        </div>
        {schedule && <ScheduleDisplay schedule={schedule} />}
      </div>
    </div>
  );
}

export default StudentDashboard;
