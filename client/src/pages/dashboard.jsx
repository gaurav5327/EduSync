import { useEffect } from "react";
import AdminDashboard from "../components/AdminDashboard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("Dashboard: Auth state check", { user, loading });

    // If not loading and not authenticated, redirect to login
    if (!loading && !user) {
      console.log("Dashboard: Not authenticated, redirecting to login");
      window.location.replace("/");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Only render if we have a user
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Redirecting to login...
      </div>
    );
  }

  return <AdminDashboard />;
}
