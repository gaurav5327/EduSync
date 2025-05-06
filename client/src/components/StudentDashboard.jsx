"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { logout, getCurrentUser, updateUserProfile } from "../utils/auth";
import ScheduleDisplay from "./ScheduleDisplay";

const API_URL = "http://localhost:3000/api/schedule";
const AUTH_API_URL = "http://localhost:3000/api/auth";

function StudentDashboard() {
  const user = getCurrentUser();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    year: user?.year || 1,
    department: user?.department || "",
    division: user?.division || "A",
  });
  const [departments, setDepartments] = useState([
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
  ]);

  useEffect(() => {
    if (user) {
      // Check if user profile is complete
      if (!user.year || !user.department || !user.division) {
        setError(
          "Your user profile is incomplete. Please update your profile information."
        );
        setShowProfileForm(true);
        setLoading(false);
      } else {
        // Only fetch schedule once when component mounts
        fetchStudentSchedule();
      }
    }
  }, []); // Remove user from dependency array to prevent infinite loops

  // Update the fetchStudentSchedule function to include better error handling and logging
  const fetchStudentSchedule = async () => {
    try {
      setLoading(true);
      setError("");

      // Log the parameters we're sending to help with debugging
      console.log("Fetching schedule with params:", {
        year: user.year,
        branch: user.department,
        division: user.division,
      });

      // Fetch the schedule for the student's year, branch, and division
      const response = await axios.get(`${API_URL}/latest`, {
        params: {
          year: user.year,
          branch: user.department,
          division: user.division,
        },
      });

      console.log("Schedule response:", response.data);
      setSchedule(response.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);

      // More detailed error message based on the error type
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server responded with error:", error.response.data);
        setError(
          `Error fetching your schedule: ${
            error.response.data.message || "Server error"
          }`
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError(
          "No response from server. Please check your connection and try again."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
        setError(`Error setting up request: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: name === "year" ? Number.parseInt(value, 10) : value,
    });
  };

  // Update the handleProfileSubmit function to prevent multiple fetches
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Update the user profile in the database
      const response = await axios.put(`${AUTH_API_URL}/update-profile`, {
        userId: user.id,
        ...profileData,
      });

      // Update the user data in localStorage
      const updatedUser = {
        ...user,
        ...profileData,
      };
      updateUserProfile(updatedUser);

      setShowProfileForm(false);
      setError("");

      // Fetch the schedule with the updated profile data
      fetchStudentSchedule();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        "Failed to update profile. Please try again or contact an administrator."
      );
      setLoading(false);
    }
  };

  if (loading && !showProfileForm) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
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
        {showProfileForm ? (
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
              Update Your Profile
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="year"
                >
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={profileData.year}
                  onChange={handleProfileChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  {[1, 2, 3, 4].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="department"
                >
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="division"
                >
                  Division
                </label>
                <select
                  id="division"
                  name="division"
                  value={profileData.division}
                  onChange={handleProfileChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  {["A", "B", "C"].map((division) => (
                    <option key={division} value={division}>
                      Division {division}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
              My Weekly Schedule
            </h2>

            {/* Add a retry button in the error message section */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <p className="font-bold">Error</p>
                <p>{error}</p>
                <div className="flex mt-2 space-x-2">
                  <button
                    onClick={fetchStudentSchedule}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => setShowProfileForm(true)}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && !schedule && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
                <p className="font-bold">No Schedule Available</p>
                <p>
                  There is no schedule available for your class yet. Please
                  check back later or contact an administrator.
                </p>
              </div>
            )}

            {schedule ? (
              <ScheduleDisplay schedule={schedule} />
            ) : (
              <p className="text-gray-500">
                No schedule available for your class yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
