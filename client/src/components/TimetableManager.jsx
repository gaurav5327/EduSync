import { useState, useEffect } from "react";
import axios from "axios";
import ScheduleDisplay from "./ScheduleDisplay";

const API_URL = "http://localhost:3000/api/schedule";

const YEARS = [1, 2, 3, 4];
const BRANCHES = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];
const DIVISIONS = ["A", "B", "C"];

function TimetableManager() {
  const [timetables, setTimetables] = useState([]);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedDivision, setSelectedDivision] = useState(DIVISIONS[0]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimetables();
  }, [selectedYear, selectedBranch, selectedDivision]);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/timetables`, {
        params: {
          year: selectedYear,
          branch: selectedBranch,
          division: selectedDivision,
        },
      });
      setTimetables(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching timetables:", error);
      setError("Error fetching timetables. Please try again later.");
      setTimetables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimetable = (timetable) => {
    setSelectedTimetable(timetable);
  };

  const handleDeleteTimetable = async (timetableId) => {
    if (!window.confirm("Are you sure you want to delete this timetable?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/timetables/${timetableId}`);
      fetchTimetables();
      if (selectedTimetable && selectedTimetable._id === timetableId) {
        setSelectedTimetable(null);
      }
    } catch (error) {
      console.error("Error deleting timetable:", error);
      setError("Error deleting timetable. Please try again.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Timetable Manager
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Filter Timetables</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {BRANCHES.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Division
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {DIVISIONS.map((division) => (
                <option key={division} value={division}>
                  Division {division}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-indigo-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading timetables...</p>
        </div>
      ) : (
        <>
          {timetables.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No timetables found for the selected criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Year
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Branch
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Division
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created At
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timetables.map((timetable) => (
                    <tr key={timetable._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {timetable._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Year {timetable.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {timetable.branch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Division {timetable.division}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(timetable.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewTimetable(timetable)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteTimetable(timetable._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedTimetable && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Selected Timetable</h3>
                <button
                  onClick={() => setSelectedTimetable(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
              <ScheduleDisplay schedule={selectedTimetable} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TimetableManager;
