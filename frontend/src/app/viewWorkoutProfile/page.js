"use client";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";
import {
  Activity,
  Calendar,
  User,
  Clock,
  Award,
  TrendingUp,
  BarChart,
  Loader,
} from "lucide-react";

export default function ViewWorkoutProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Fetch user workout profile data
  useEffect(() => {
    fetchWorkoutProfile();
  }, []);

  const fetchWorkoutProfile = async () => {
    const token = Cookies.get("token");

    if (!token) {
      setLoading(false);
      toast.error("You must be logged in to view your workout profile.");
      return;
    }

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
        "https://bursting-shepherd-promoted.ngrok-free.app/api/auth/user/workout/profile",
        requestOptions
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workout profile data.");
      }

      const result = await response.json();

      if (result.status === "success") {
        const data = result.data;
        // Check if workout plan is null or empty
        if (
          !data.recommended_exercise_plan ||
          data.recommended_exercise_plan.length === 0
        ) {
          // If workout plan is null/empty, we'll still set the profile data
          // but we won't automatically generate a plan (user can click the button)
          setProfileData(data);
        } else {
          setProfileData(data);
        }
      } else {
        // Handle API success=false response
        console.warn("API returned error:", result.message || "Unknown error");
        setProfileData({}); // Set empty object instead of null
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileData({}); // Set empty object instead of null
    } finally {
      setLoading(false);
    }
  };

  // Generate a new workout plan
  const generateWorkoutPlan = async () => {
    const token = Cookies.get("token");

    if (!token) {
      toast.error("You must be logged in to generate a workout plan.");
      return;
    }

    setGeneratingPlan(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("ngrok-skip-browser-warning", "790355");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://bursting-shepherd-promoted.ngrok-free.app/api/auth/personalize",
        requestOptions
      );

      if (!response.ok) {
        throw new Error("Failed to generate workout plan.");
      }

      const result = await response.json();

      if (result.status === "success") {
        toast.success("Workout plan generated successfully!");
        // Refresh profile data to get the new workout plan
        await fetchWorkoutProfile();
        // Switch to workout tab to show the new plan
        setActiveTab("workout");
      } else {
        toast.error(result.message || "Failed to generate workout plan.");
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error(
        "An error occurred while generating your workout plan. Please try again."
      );
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Calculate BMI if data is available
  const calculateBMI = () => {
    if (!profileData || !profileData.height || !profileData.weight) return null;

    const heightInMeters = profileData.height / 100;
    const bmi = (
      profileData.weight /
      (heightInMeters * heightInMeters)
    ).toFixed(1);

    let status;
    if (bmi < 18.5) status = "Underweight";
    else if (bmi < 25) status = "Normal";
    else if (bmi < 30) status = "Overweight";
    else status = "Obese";

    return { bmi, status };
  };

  const bmiData = calculateBMI();

  // Safe access function to prevent errors with undefined properties
  const safeGet = (obj, path, defaultValue = "N/A") => {
    if (!obj) return defaultValue;
    const pathArray = path.split(".");
    let current = obj;

    for (const key of pathArray) {
      if (current === undefined || current === null) return defaultValue;
      current = current[key];
    }

    return current === undefined || current === null ? defaultValue : current;
  };

  // Check if workout plan exists and has items
  const hasWorkoutPlan =
    profileData &&
    profileData.recommended_exercise_plan &&
    profileData.recommended_exercise_plan.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-4 md:p-8 text-gray-200 relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-purple-700/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
        <div className="absolute top-2/3 left-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="w-full py-12 bg-gradient-to-r from-blue-900/80 via-purple-900/80 to-cyan-900/80 mb-10 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:text-left text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">
              Your Workout Profile
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-300 max-w-3xl">
              Track your fitness journey with personalized workouts
            </p>
            <div className="mt-8 h-1 w-32 md:mx-0 mx-auto bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full shadow-sm"></div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30"
                : "bg-gray-800/40 backdrop-blur-sm hover:bg-gray-700/40"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
              activeTab === "workout"
                ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30"
                : "bg-gray-800/40 backdrop-blur-sm hover:bg-gray-700/40"
            }`}
            onClick={() => setActiveTab("workout")}
          >
            <Activity size={18} />
            <span>Workout Plan</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <p className="text-cyan-400 animate-pulse">
              Loading your profile...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Information - Shown when activeTab is "profile" */}
            {activeTab === "profile" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User Stats Card */}
                  <div className="bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-800 hover:border-gray-700 transition-all duration-500 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <User className="text-cyan-400" size={24} />
                        <h2 className="text-xl font-bold text-white">
                          Personal Details
                        </h2>
                      </div>
                      <div className="space-y-3 text-gray-300">
                        <p className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="font-medium">
                            {safeGet(profileData, "email")}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400">Gender:</span>
                          <span className="font-medium">
                            {safeGet(profileData, "your_gender")}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400">Date of Birth:</span>
                          <span className="font-medium">
                            {safeGet(profileData, "date_of_birth")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Physical Stats Card */}
                  <div className="bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-800 hover:border-gray-700 transition-all duration-500 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <BarChart className="text-purple-400" size={24} />
                        <h2 className="text-xl font-bold text-white">
                          Physical Stats
                        </h2>
                      </div>
                      <div className="space-y-3 text-gray-300">
                        <p className="flex justify-between">
                          <span className="text-gray-400">Weight:</span>
                          <span className="font-medium">
                            {safeGet(profileData, "weight") !== "N/A"
                              ? `${safeGet(profileData, "weight")} kg`
                              : "N/A"}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400">Height:</span>
                          <span className="font-medium">
                            {safeGet(profileData, "height") !== "N/A"
                              ? `${safeGet(profileData, "height")} cm`
                              : "N/A"}
                          </span>
                        </p>
                        {bmiData && (
                          <p className="flex justify-between">
                            <span className="text-gray-400">BMI:</span>
                            <span className="font-medium">
                              {bmiData.bmi} ({bmiData.status})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Workout Preferences Card */}
                  <div className="bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-800 hover:border-gray-700 transition-all duration-500 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <Award className="text-teal-400" size={24} />
                        <h2 className="text-xl font-bold text-white">
                          Workout Goals
                        </h2>
                      </div>
                      <div className="space-y-3 text-gray-300">
                        <p className="flex justify-between">
                          <span className="text-gray-400">Primary Goal:</span>
                          <span className="font-medium">
                            {safeGet(
                              profileData,
                              "primary_goal_for_exercising"
                            )}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400">Intensity:</span>
                          <span className="font-medium">
                            {safeGet(profileData, "workout_intensity")}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="font-medium">
                            {safeGet(profileData, "workout_duration")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Stats and Info Card - Can add more relevant user stats here */}
                <div className="bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-800 hover:border-gray-700 transition-all duration-500">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Fitness Overview
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/70 p-4 rounded-xl flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                        <TrendingUp className="text-blue-400" size={20} />
                      </div>
                      <p className="text-sm text-gray-400">Primary Focus</p>
                      <p className="font-medium text-center">
                        {safeGet(profileData, "primary_goal_for_exercising")}
                      </p>
                    </div>

                    <div className="bg-gray-800/70 p-4 rounded-xl flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                        <Activity className="text-purple-400" size={20} />
                      </div>
                      <p className="text-sm text-gray-400">Intensity</p>
                      <p className="font-medium">
                        {safeGet(profileData, "workout_intensity")}
                      </p>
                    </div>

                    <div className="bg-gray-800/70 p-4 rounded-xl flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mb-2">
                        <Clock className="text-teal-400" size={20} />
                      </div>
                      <p className="text-sm text-gray-400">Workout Length</p>
                      <p className="font-medium">
                        {safeGet(profileData, "workout_duration")}
                      </p>
                    </div>

                    <div className="bg-gray-800/70 p-4 rounded-xl flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                        <Calendar className="text-cyan-400" size={20} />
                      </div>
                      <p className="text-sm text-gray-400">Workouts/Week</p>
                      <p className="font-medium">
                        {hasWorkoutPlan
                          ? new Set(
                              profileData.recommended_exercise_plan.map(
                                (ex) => ex.day
                              )
                            ).size
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Workout Plan - Shown when activeTab is "workout" */}
            {activeTab === "workout" && (
              <div className="bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="text-cyan-400" size={24} />
                  <h2 className="text-2xl font-bold text-white">
                    Your Workout Plan
                  </h2>
                </div>

                {hasWorkoutPlan ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profileData.recommended_exercise_plan.map(
                      (exercise, index) => (
                        <div
                          key={index}
                          className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-800/70 transition duration-300 transform hover:translate-y-[-4px] border border-gray-700/30 hover:border-gray-600/50 hover:shadow-lg hover:shadow-blue-900/20 group"
                        >
                          <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                              {safeGet(exercise, "exercise_name")}
                            </h3>
                            <div className="text-gray-300 space-y-2">
                              <p className="flex justify-between">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <Calendar size={16} />
                                  <span>Day:</span>
                                </span>
                                <span className="font-medium">
                                  {safeGet(exercise, "day")}
                                </span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <Clock size={16} />
                                  <span>Duration:</span>
                                </span>
                                <span className="font-medium">
                                  {safeGet(exercise, "duration")}
                                </span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <TrendingUp size={16} />
                                  <span>Reps:</span>
                                </span>
                                <span className="font-medium">
                                  {safeGet(exercise, "exercise_reps")}
                                </span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <Activity size={16} />
                                  <span>Sets:</span>
                                </span>
                                <span className="font-medium">
                                  {safeGet(exercise, "exercise_sets")}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl text-center">
                    <p className="text-gray-400 mb-4">
                      No workout plan available. Generate a personalized workout
                      plan based on your profile.
                    </p>
                    <button
                      onClick={generateWorkoutPlan}
                      disabled={generatingPlan}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    >
                      {generatingPlan ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Generating Plan...
                        </>
                      ) : (
                        "Generate Workout Plan"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="w-full mt-16 py-8 bg-gradient-to-r from-blue-900/70 via-purple-900/70 to-pink-900/70 rounded-t-2xl backdrop-blur-lg border-t border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl opacity-30"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                  Stay consistent with your workouts for optimal results!
                </p>
                <p className="text-gray-400 mt-2">
                  Track, compete, and achieve your fitness goals
                </p>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
                  <span className="text-blue-300">📊</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
                  <span className="text-purple-300">💪</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer">
                  <span className="text-pink-300">🏆</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Fitness Leaderboard. All rights reserved.
              </p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">
                  Privacy
                </span>
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">
                  Terms
                </span>
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">
                  Contact
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Container with Custom Styling */}
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
