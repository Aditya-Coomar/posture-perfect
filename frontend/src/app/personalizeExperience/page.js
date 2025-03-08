"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

export default function PersonalizeExperiencePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    your_gender: "Male",
    weight: "",
    height: "",
    date_of_birth: "",
    primary_goal_for_exercising: "Lose weight",
    how_often_exercised_at_past: "Never",
    workout_intensity: "Low",
    workout_duration: "30 minutes",
    what_days_a_week_you_will_workout: [],
    what_time_of_day_you_will_workout: "Morning",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // Handle checkboxes for workout days
      setFormData((prev) => ({
        ...prev,
        what_days_a_week_you_will_workout: checked
          ? [...prev.what_days_a_week_you_will_workout, value]
          : prev.what_days_a_week_you_will_workout.filter(
              (day) => day !== value
            ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get the token from cookies
    const token = Cookies.get("token");

    if (!token) {
      toast.error("You must be logged in to personalize your experience.");
      setIsSubmitting(false);
      return;
    }

    // Convert weight and height to integers
    const weight = parseInt(formData.weight, 10);
    const height = parseInt(formData.height, 10);

    if (isNaN(weight)) {
      toast.error("Weight must be a valid number.");
      setIsSubmitting(false);
      return;
    }

    if (isNaN(height)) {
      toast.error("Height must be a valid number.");
      setIsSubmitting(false);
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

    const raw = JSON.stringify({
      ...formData,
      weight,
      height,
      what_days_a_week_you_will_workout:
        formData.what_days_a_week_you_will_workout.join(", "),
    });

    console.log(raw);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://bursting-shepherd-promoted.ngrok-free.app/api/auth/personalize",
        requestOptions
      );

      if (!response.ok) {
        throw new Error("Failed to personalize experience.");
      }

      const result = await response.json();
      console.log(result);

      // Show success toast
      toast.success("Experience personalized successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        router.push("/home");
      }, 3000);
    } catch (error) {
      console.error(error);

      // Show error toast
      toast.error(error.message || "An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Staggered animation for form elements
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-900 text-gray-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/50 backdrop-blur-lg shadow-lg p-4 border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Personalize Your Experience
          </motion.h1>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => router.back()}
            className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-300 cursor-pointer shadow-md border border-gray-600/30 group"
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto backdrop-blur-lg bg-gray-900/50 p-8 rounded-xl shadow-xl border border-gray-700/30"
        >
          <h2 className="text-xl font-semibold text-white mb-2">
            Personalize Your Fitness Plan
          </h2>
          <p className="text-gray-400 mb-6">
            Fill out the form to customize your fitness experience and receive a
            tailored workout plan.
          </p>

          {/* Form */}
          <motion.form
            variants={container}
            initial="hidden"
            animate="show"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* Gender */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Gender
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="your_gender"
                      value="Male"
                      checked={formData.your_gender === "Male"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        formData.your_gender === "Male"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-gray-600 bg-gray-800"
                      } flex items-center justify-center transition-all duration-200`}
                    >
                      {formData.your_gender === "Male" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300">Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="your_gender"
                      value="Female"
                      checked={formData.your_gender === "Female"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        formData.your_gender === "Female"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-gray-600 bg-gray-800"
                      } flex items-center justify-center transition-all duration-200`}
                    >
                      {formData.your_gender === "Female" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300">Female</span>
                </label>
              </div>
            </motion.div>

            {/* Weight */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z"
                    clipRule="evenodd"
                  />
                </svg>
                Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all duration-300 shadow-sm"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Height */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v1a2 2 0 00-2 2v1a1 1 0 102 0v-1h1v1a1 1 0 102 0v-1a2 2 0 002-2v-1a2 2 0 002-2V6a1 1 0 00-1-1H8v1zm7 6a1 1 0 01-1 1h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 112 0v1h1a1 1 0 011 1z"
                    clipRule="evenodd"
                  />
                </svg>
                Height (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all duration-300 shadow-sm"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Date of Birth */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all duration-300 shadow-sm"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Primary Goal for Exercising */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Primary Goal for Exercising
              </label>
              <div className="relative">
                <select
                  name="primary_goal_for_exercising"
                  value={formData.primary_goal_for_exercising}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-300 shadow-sm appearance-none"
                  required
                >
                  <option value="Lose weight">Lose weight</option>
                  <option value="Build muscle">Build muscle</option>
                  <option value="Stay fit">Stay fit</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* How Often Exercised in the Past */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                How Often Exercised in the Past
              </label>
              <div className="relative">
                <select
                  name="how_often_exercised_at_past"
                  value={formData.how_often_exercised_at_past}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-300 shadow-sm appearance-none"
                  required
                >
                  <option value="Never">Never</option>
                  <option value="Rarely">Rarely</option>
                  <option value="Sometimes">Sometimes</option>
                  <option value="Often">Often</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Workout Intensity */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
                Workout Intensity
              </label>
              <div className="relative">
                <select
                  name="workout_intensity"
                  value={formData.workout_intensity}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-300 shadow-sm appearance-none"
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Workout Duration */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Workout Duration
              </label>
              <div className="relative">
                <select
                  name="workout_duration"
                  value={formData.workout_duration}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-300 shadow-sm appearance-none"
                  required
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="45 minutes">45 minutes</option>
                  <option value="60 minutes">60 minutes</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Workout Days */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                What Days a Week Will You Workout?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="what_days_a_week_you_will_workout"
                        value={day}
                        checked={formData.what_days_a_week_you_will_workout.includes(
                          day
                        )}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border ${
                          formData.what_days_a_week_you_will_workout.includes(
                            day
                          )
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-gray-600 bg-gray-800"
                        } flex items-center justify-center transition-all duration-200 group-hover:border-purple-400`}
                      >
                        {formData.what_days_a_week_you_will_workout.includes(
                          day
                        ) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-purple-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-300 text-sm">{day}</span>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Workout Time */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                What Time of Day Will You Workout?
              </label>
              <div className="relative">
                <select
                  name="what_time_of_day_you_will_workout"
                  value={formData.what_time_of_day_you_will_workout}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all duration-300 shadow-sm appearance-none"
                  required
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={item} className="mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 shadow-lg ${
                  isSubmitting
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
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
                    Processing...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Create My Personalized Plan
                  </span>
                )}
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </main>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}