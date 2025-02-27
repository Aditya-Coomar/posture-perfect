"use client";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  // Check if the user is authenticated (has a token)
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/"); // Redirect to login if no token is found
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    Cookies.remove("token"); // Clear the token from cookies
    router.push("/"); // Redirect to the login page
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome to Posture Perfect
        </h1>
        <div className="flex items-center gap-4">
          {/* Edit Profile Button */}
          <Link
            href="/personalizeExperience"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
          >
            Edit Profile
          </Link>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Dashboard
          </h2>
          <p className="text-gray-600">
            Welcome back! Here’s a quick overview of your progress and
            activities.
          </p>

          {/* Placeholder Content */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">
                Daily Progress
              </h3>
              <p className="text-gray-600 mt-2">
                Track your daily posture improvements and activities.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">
                Weekly Goals
              </h3>
              <p className="text-gray-600 mt-2">
                Set and achieve your weekly posture goals.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
