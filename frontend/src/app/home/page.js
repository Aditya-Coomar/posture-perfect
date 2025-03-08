"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [workoutData, setWorkoutData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if the user is authenticated (has a token)
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  // Fetch workout recommendations
  const fetchWorkoutRecommendations = async () => {
    const token = Cookies.get("token");

    if (!token) {
      toast.error("You must be logged in to view workout recommendations.");
      return;
    }

    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("ngrok-skip-browser-warning", "790355");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://bursting-shepherd-promoted.ngrok-free.app/api/auth/workout/recommendation",
        requestOptions
      );

      const text = await response.text();
      console.log("Raw Response:", text);

      const result = JSON.parse(text);
      console.log("Parsed JSON:", result);

      if (result.status === "success" && result.data.length > 0) {
        setWorkoutData(result.data);
      } else {
        setWorkoutData([]);
        toast.info("No workout recommendations available.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch workout recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-sm bg-slate-900/70 border-b border-gray-700/30 p-4 flex justify-between items-center shadow-lg shadow-purple-900/10"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Posture
            </span>{" "}
            <span className="text-white">Perfect</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Edit Profile Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/personalizeExperience"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 cursor-pointer shadow-md shadow-blue-900/20"
            >
              Edit Profile
            </Link>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition duration-300 cursor-pointer shadow-md shadow-red-900/20"
          >
            Logout
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-8 relative z-10 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto backdrop-blur-lg p-8 rounded-2xl border border-gray-700/30 shadow-[0_0_15px_rgba(76,29,149,0.15)] bg-gradient-to-br from-gray-900/80 to-gray-800/80"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Your Dashboard
          </h2>
          <p className="text-gray-300">
            Welcome back! Here's a quick overview of your progress and
            activities.
          </p>

          {/* Dashboard Boxes */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="backdrop-blur-sm bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-700/20 shadow-lg shadow-blue-900/10"
            >
              <h3 className="text-lg font-semibold text-blue-400">
                Live Workout
              </h3>
              <p className="text-gray-300 mt-2">
                <a
                  href="/liveWorkout"
                  className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300"
                >
                  Proceed to track your daily workout →
                </a>
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="backdrop-blur-sm bg-gradient-to-br from-green-900/40 to-green-800/20 p-6 rounded-xl border border-green-700/20 shadow-lg shadow-green-900/10"
            >
              <h3 className="text-lg font-semibold text-green-400">
                Compete with Friends
              </h3>
              <p className="text-gray-300 mt-2 hover:underline transition-colors duration-300">
                <a href="/leaderboard">View Leaderboard →</a>
              </p>
            </motion.div>
          </div>

          {/* View Personalized Workout Button */}
          {/* View Personalized Workout Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchWorkoutRecommendations}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition duration-300 cursor-pointer shadow-lg shadow-purple-900/20 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7-7 7"
                    ></path>
                  </svg>
                )}
                {loading ? "Loading..." : "View Personalized Workout"}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/viewWorkoutProfile")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 transition duration-300 cursor-pointer shadow-lg shadow-blue-900/20 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
              <span className="relative flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                View Workout Profile
              </span>
            </motion.button>
          </div>

          {/* Workout Recommendations */}
          {workoutData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                Your Personalized Workout Plan
              </h3>
              <div className="space-y-4">
                {workoutData.map((workout, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 backdrop-blur-sm bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border border-purple-700/20 shadow-md shadow-purple-900/10"
                  >
                    <h4 className="text-lg font-semibold text-purple-400">
                      {workout.exercise_name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      <p className="text-gray-300">
                        <span className="font-medium text-gray-400">Reps:</span>{" "}
                        {workout.exercise_reps}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium text-gray-400">Sets:</span>{" "}
                        {workout.exercise_sets}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium text-gray-400">
                          Duration:
                        </span>{" "}
                        {workout.duration}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium text-gray-400">Days:</span>{" "}
                        {workout.day}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="p-6 text-center text-gray-400 z-10 relative w-full mt-16 backdrop-blur-lg bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 border-t border-white/10 rounded-t-xl"
      >
        <div className="absolute inset-0 bg-white/5 rounded-t-xl"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-lg opacity-30 rounded-t-xl"></div>

        <div className="relative z-10">
          <div className="flex justify-center gap-6">
            <a
              href="#"
              className="text-blue-400 hover:text-purple-400 transition-colors duration-300 relative group"
            >
              Privacy Policy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#"
              className="text-blue-400 hover:text-purple-400 transition-colors duration-300 relative group"
            >
              Terms of Service
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>
          <div className="mt-2">
            © {new Date().getFullYear()} Posture Perfect
          </div>
        </div>
      </motion.footer>

      {/* Toast Container with custom styling */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
