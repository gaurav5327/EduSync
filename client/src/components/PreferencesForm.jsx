import { useState } from "react";

function PreferencesForm({ onSubmit, courses, initialPreferences }) {
  const [preferences, setPreferences] = useState(initialPreferences || []);

  const handleChange = (courseId) => {
    const updatedPreferences = [...preferences];
    const index = updatedPreferences.indexOf(courseId);

    if (index === -1) {
      updatedPreferences.push(courseId);
    } else {
      updatedPreferences.splice(index, 1);
    }

    setPreferences(updatedPreferences);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <h2 className="text-2xl font-bold mb-4">Update Preferences</h2>
      <div className="mb-4">
        {courses.map((course) => (
          <div key={course._id} className="mb-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={preferences.includes(course._id)}
                onChange={() => handleChange(course._id)}
              />
              <span className="ml-2">{course.name}</span>
            </label>
          </div>
        ))}
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Update Preferences
      </button>
    </form>
  );
}

export default PreferencesForm;
