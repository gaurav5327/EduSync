import Navbar from "./Navbar";

const Teachers = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Our Teachers</h1>
          <p className="mt-4 text-lg text-gray-500">
            This page will display information about our teachers. You can add a
            list or grid of teacher profiles here.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Teachers;
