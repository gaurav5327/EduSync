import { useEffect } from "react";
import Login from "../components/Login";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("Home: Auth state check", { user, loading });

    // Only redirect if we're not loading and have a user
    if (!loading && user) {
      console.log("Home: Redirecting authenticated user to dashboard");
      window.location.href = "/dashboard";
    }
  }, [user, loading]); // This will run when user or loading changes

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return <Login />;
  }

  // This will show briefly before redirect happens
  return (
    <div className="flex items-center justify-center h-screen">
      Redirecting to dashboard...
    </div>
  );
}
