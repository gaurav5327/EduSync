import Navbar from "./Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main
        className="flex-grow flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.jpg')",
        }}
      >
        <div className="text-center bg-white bg-opacity-75 p-12 rounded-lg shadow-xl">
          <h1 className="text-5xl font-bold text-indigo-600 mb-4">
            Welcome to Class Scheduler
          </h1>
          <p className="text-xl text-gray-700">
            Efficiently manage your class schedules with ease.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
