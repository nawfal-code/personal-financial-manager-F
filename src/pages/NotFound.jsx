import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full animate-fadeIn">
        {/* 404 Number */}
        <h1 className="text-7xl font-extrabold text-blue-600 mb-2 animate-bounceSlow">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>

        <p className="text-gray-500 mb-6">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow"
        >
          Go to Dashboard
        </Link>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounceSlow {
          animation: bounceSlow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
