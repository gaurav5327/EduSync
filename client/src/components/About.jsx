import Navbar from "./Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
          <p className="mt-4 text-lg text-gray-500">
            This is the about page for our Class Scheduler application. Here you
            can add information about your school or institution.
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;
