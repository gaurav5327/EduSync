import Navbar from "./Navbar";

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50"
     style={{
        backgroundImage: "url('/background5.jpg')",
        backgroundSize: "cover",
      }}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            About EduSync
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-xl text-black">
            Learn more about our mission to simplify academic scheduling.
          </p>
        </div>

        <div className="mt-8 bg-white p-8 rounded-lg">
          <div className="prose prose-indigo prose-lg  text-gray-800 mx-auto">
            <h2>Our Mission,</h2>
            <p>
              EduSync was created to solve the complex problem of
              academic scheduling. Our mission is to provide educational
              institutions with a powerful, easy-to-use tool that saves time and
              reduces conflicts in the scheduling process.
            </p>

            <h2>How It Works</h2>
            <p>
              Our system uses advanced algorithms including genetic algorithms
              and constraint satisfaction problems (CSP) to generate optimal
              schedules. It takes into account various constraints such as:
            </p>
            <ul>
              <li>Teacher availability and preferences</li>
              <li>Room availability and capacity</li>
              <li>Course requirements</li>
              <li>Department and year constraints</li>
              <li>Special requirements for lab sessions</li>
            </ul>

            <h2>Key Features</h2>
            <p>
              Class Scheduler offers a comprehensive set of features designed to
              make academic scheduling as efficient as possible:
            </p>
            <ul>
              <li>Automated schedule generation</li>
              <li>Conflict detection and resolution</li>
              <li>Teacher availability management</li>
              <li>Room allocation optimization</li>
              <li>Support for both theory and lab courses</li>
              <li>Department and year-specific constraints</li>
              <li>
                User-friendly interface for administrators, teachers, and
                students
              </li>
            </ul>

            <h2>Contact Us</h2>
            <p>
              If you have any questions or would like to learn more about Class
              Scheduler, please don't hesitate to contact us.
            </p>
            <p>
              Email: edusync@gmail.com
              <br />
              Phone: (123) 456-7890
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
