import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">
        404
      </h1>

      <p className="mt-3 text-gray-500">
        Page Not Found
      </p>

      <Link
        to="/"
        className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;