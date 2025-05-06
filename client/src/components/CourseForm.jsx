"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://edusync-backend-gvgh.onrender.com/api/schedule";

const TIME_SLOTS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
];

function CourseForm({ addCourse }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    instructor: "",
    duration: "",
    capacity: "",
    lectureType: "theory",
    preferredTimeSlots: [],
  });
  const [instructors, setInstructors] = useState([]);
  const [existingCourses, setExistingCourses] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchInstructors();
    fetchExistingCourses();
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

  const fetchExistingCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses-all`);
      setExistingCourses(response.data);
    } catch (error) {
      console.error("Error fetching existing courses:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prevState) => ({
        ...prevState,
        preferredTimeSlots: checked
          ? [...prevState.preferredTimeSlots, value]
          : prevState.preferredTimeSlots.filter((slot) => slot !== value),
      }));
    } else if (type === "radio") {
      if (name === "lectureType") {
        if (value === "lab") {
          // If switching to lab, automatically set duration to 120 minutes and preferred time slots to 3-5 PM
          setFormData((prevState) => ({
            ...prevState,
            lectureType: value,
            duration: "120", // Set lab duration to 120 minutes
            preferredTimeSlots: ["15:00", "16:00"],
          }));
        } else {
          setFormData((prevState) => ({
            ...prevState,
            [name]: value,
            duration: prevState.duration === "120" ? "120" : prevState.duration,
                      // Reset duration if it was set for lab
          }));
        }
      } else {
        setFormData((prevState) => ({ ...prevState, [name]: value }));
      }
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));

      // If selecting an existing course code, auto-fill the name
      if (name === "code") {
        const matchingCourse = existingCourses.find(
          (course) => course.code === value
        );
        if (matchingCourse) {
          setFormData((prevState) => ({
            ...prevState,
            name: matchingCourse.name,
          }));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Validate lab duration is 120 minutes
      if (formData.lectureType === "lab" && formData.duration !== "120") {
        setError("Lab duration must be 120 minutes (2 hours)");
        return;
      }

      // Check if the instructor has already been assigned to 2 subjects in this division
      const response = await axios.get(`${API_URL}/instructor-subjects`, {
        params: {
          instructorId: formData.instructor,
        },
      });

      if (response.data.count >= 2) {
        setError("This instructor has already been assigned to 2 subjects.");
        return;
      }

      // For lab courses, ensure they are scheduled in the correct time slots
      if (formData.lectureType === "lab") {
        // If no time slots are selected for a lab, automatically set them
        const updatedFormData = { ...formData };
        if (formData.preferredTimeSlots.length === 0) {
          updatedFormData.preferredTimeSlots = ["15:00", "16:00"];
        }

        // Ensure at least one lab time slot is selected
        const hasValidTimeSlots = updatedFormData.preferredTimeSlots.some(
          (slot) => ["15:00", "16:00"].includes(slot)
        );
        if (!hasValidTimeSlots) {
          setError(
            "Lab courses must be scheduled between 3:00 PM and 5:00 PM."
          );
          return;
        }

        console.log("Submitting lab course data:", updatedFormData);
        await addCourse(updatedFormData);
      } else {
        console.log("Submitting theory course data:", formData);
        await addCourse(formData);
      }

      setSuccess(
        `${
          formData.lectureType === "theory" ? "Theory" : "Lab"
        } course added successfully!`
      );

      // Reset form but keep the same course code if adding a lab after theory
      if (formData.lectureType === "theory") {
        const courseCode = formData.code;
        const courseName = formData.name;

        // Ask if they want to add a lab component
        if (
          window.confirm(
            "Would you like to add a lab component for this course?"
          )
        ) {
          setFormData({
            name: courseName,
            code: courseCode,
            instructor: "",
            duration: "",
            capacity: "",
            lectureType: "lab", // Switch to lab for convenience
            preferredTimeSlots: ["15:00", "16:00"],
          });
        } else {
          // Reset completely if they don't want to add a lab
          setFormData({
            name: "",
            code: "",
            instructor: "",
            duration: "",
            capacity: "",
            lectureType: "theory",
            preferredTimeSlots: [],
          });
        }
      } else {
        // Reset completely after adding a lab
        setFormData({
          name: "",
          code: "",
          instructor: "",
          duration: "",
          capacity: "",
          lectureType: "theory",
          preferredTimeSlots: [],
        });
      }

      // Refresh the list of existing courses
      fetchExistingCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while adding the course"
      );
    }
  };

  // Get unique course codes from existing courses
  const uniqueCourseCodes = [
    ...new Set(existingCourses.map((course) => course.code)),
  ];

  return (
    <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">Add Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Lecture Type
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="lectureType"
                value="theory"
                checked={formData.lectureType === "theory"}
                onChange={handleChange}
                className="form-radio h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">Theory</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="lectureType"
                value="lab"
                checked={formData.lectureType === "lab"}
                onChange={handleChange}
                className="form-radio h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">Lab</span>
            </label>
          </div>
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
          {formData.lectureType === "lab" && (
            <p className="text-sm text-gray-500 mt-1">
              You can use the same code as a theory course to create a lab
              component for that course.
            </p>
          )}
        </div>

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
            readOnly={formData.lectureType === "lab"} // Make readonly for lab courses
            required
          />
          {formData.lectureType === "lab" && (
            <p className="text-sm text-indigo-600 mt-1">
              Lab duration is fixed at 120 minutes (2 hours)
            </p>
          )}
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
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map((slot) => (
              <label
                key={slot.value}
                className={`inline-flex items-center ${
                  formData.lectureType === "lab" &&
                  !["15:00", "16:00"].includes(slot.value)
                    ? "opacity-50"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="preferredTimeSlots"
                  value={slot.value}
                  checked={formData.preferredTimeSlots.includes(slot.value)}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                  disabled={
                    formData.lectureType === "lab" &&
                    !["15:00", "16:00"].includes(slot.value)
                  }
                />
                <span className="ml-2 text-gray-700">{slot.label}</span>
              </label>
            ))}
          </div>
          {formData.lectureType === "lab" && (
            <p className="text-sm text-indigo-600 mt-2">
              Note: Labs can only be scheduled between 3:00 PM and 5:00 PM
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-xs italic mb-4">{success}</p>
        )}

        <div className="flex items-center justify-between">
          <button
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            type="submit"
          >
            Add {formData.lectureType === "theory" ? "Theory" : "Lab"} Course
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseForm;
