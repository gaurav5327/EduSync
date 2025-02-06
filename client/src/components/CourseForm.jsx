import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/schedule";

function CourseForm({ addCourse }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    instructor: "",
    duration: "",
    capacity: "",
    description: "",
    preferredTimeSlots: [],
  });
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(`${API_URL}/instructors`);
      setInstructors(response.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError("Error fetching instructors. Please try again later.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTimeSlotChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      preferredTimeSlots: checked
        ? [...prevState.preferredTimeSlots, value]
        : prevState.preferredTimeSlots.filter((slot) => slot !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCourse(formData);
      setFormData({
        name: "",
        code: "",
        instructor: "",
        duration: "",
        capacity: "",
        description: "",
        preferredTimeSlots: [],
      });
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while adding the course"
      );
    }
  };

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  return (
    <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">Add Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Course Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="code"
          >
            Course Code
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            id="code"
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="instructor"
          >
            Instructor
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            id="instructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            required
          >
            <option value="">Select an instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="duration"
          >
            Duration (minutes)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            id="duration"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="capacity"
          >
            Capacity
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            id="capacity"
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Preferred Time Slots
          </label>
          <div className="flex flex-wrap">
            {timeSlots.map((slot) => (
              <label key={slot} className="inline-flex items-center mr-4 mb-2">
                <input
                  type="checkbox"
                  value={slot}
                  checked={formData.preferredTimeSlots.includes(slot)}
                  onChange={handleTimeSlotChange}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-2 text-gray-700">{slot}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
        <div className="flex items-center justify-between">
          <button
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            type="submit"
          >
            Add Course
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseForm;
