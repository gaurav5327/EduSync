import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-indigo-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-3xl font-serif">
                EduSync
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Link
                to="/"
                className="text-white hover:bg-indigo-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:bg-indigo-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <Link
                to="/teachers"
                className="text-white hover:bg-indigo-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Teachers
              </Link>
              <Link
                to="/login"
                className="text-white hover:bg-indigo-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-500 text-white hover:bg-indigo-400 px-3 py-2 rounded-md text-sm font-medium ml-2"
              >
                Register Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
