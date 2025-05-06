import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import ScheduleDisplay from "./ScheduleDisplay";

const API_URL = "https://edusync-backend-gvgh.onrender.com/api/schedule";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { year, branch } = router.query;

  useEffect(() => {
    if (year && branch) {
      fetchSchedule();
    }
  }, [year, branch]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${API_URL}/latest`, {
        params: { year, branch },
      });
      setSchedule(response.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError("Failed to fetch schedule. Please try again later.");
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!schedule) {
    return <div>Loading schedule...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        Schedule for Year {year} - {branch}
      </h1>
      <ScheduleDisplay schedule={schedule} year={year} branch={branch} />
      <button
        onClick={() => router.back()}
        className="mt-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
