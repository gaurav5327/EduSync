import Navbar from "./Navbar";

function HomePage() {
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
          <h1 className="text-4xl font-serif text-cyan-950 sm:text-5xl sm:tracking-tight lg:text-6xl">
            EduSync
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-black">
            Efficiently manage your institution's class schedules with our
            advanced scheduling system.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Automated Scheduling
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Our intelligent algorithm creates conflict-free schedules that
                  optimize resource utilization.
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Teacher Preferences
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Teachers can set their availability and preferences for a more
                  accommodating schedule.
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Conflict Resolution
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Automatically detect and resolve scheduling conflicts with our
                  advanced algorithms.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
