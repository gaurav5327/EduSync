import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import TeachersPage from "./components/TeachersPage";
import AdminRegistration from "./components/AdminRegistration";
import { getCurrentUser } from "./utils/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = getCurrentUser();
    setUser(loggedInUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Protected route component
  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case "admin":
          return <Navigate to="/admin-dashboard" replace />;
        case "teacher":
          return <Navigate to="/teacher-dashboard" replace />;
        case "student":
          return <Navigate to="/student-dashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }

    return element;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route
          path="/login"
          element={
            user ? <Navigate to={`/${user.role}-dashboard`} /> : <Login />
          }
        />
        <Route
          path="/register-admin"
          element={
            user ? (
              <Navigate to={`/${user.role}-dashboard`} />
            ) : (
              <AdminRegistration />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              element={<AdminDashboard />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute
              element={<TeacherDashboard />}
              allowedRoles={["teacher"]}
            />
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute
              element={<StudentDashboard />}
              allowedRoles={["student"]}
            />
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
