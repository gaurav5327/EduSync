import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

const API_URL = "https://edusync-backend-gvgh.onrender.com/api/schedule";

function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers-public`);
      setTeachers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError("Error fetching teachers. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: "url('/background5.jpg')",
        backgroundSize: "cover",
      }}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Our Teachers
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-black">
            Meet our dedicated faculty members who make learning a wonderful
            experience.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center mt-16">
            <div className="spinner-border text-indigo-500" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center mt-16 text-red-500">{error}</div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl font-bold">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {teacher.department}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Specialization:</span>{" "}
                      {teacher.department}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Teaching Years:</span>{" "}
                      {teacher.teachableYears?.join(", ") || "All years"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeachersPage;
