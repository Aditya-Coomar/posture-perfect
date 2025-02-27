"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // Handle checkboxes for workout days
      setFormData((prev) => ({
        ...prev,
        what_days_a_week_you_will_workout: checked
          ? [...prev.what_days_a_week_you_will_workout, value]
          : prev.what_days_a_week_you_will_workout.filter((day) => day !== value),
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

    // Get the token from cookies
    const token = Cookies.get("token");

    if (!token) {
      toast.error("You must be logged in to personalize your experience.");
      return;
    }

    // Convert weight and height to integers
    const weight = parseInt(formData.weight, 10);
    const height = parseInt(formData.height, 10);
    if (isNaN(weight)) {
      toast.error("Weight must be a valid number.");
      return;
    }

    if (isNaN(height)) {
      toast.error("Height must be a valid number.");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

    const raw = JSON.stringify({
      ...formData,
      weight,
      height,
      what_days_a_week_you_will_workout : formData.what_days_a_week_you_will_workout.join(", "),
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Personalize Your Experience
        </h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 cursor-pointer"
        >
          Back to Home
        </button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Personalize Your Fitness Plan
          </h2>
          <p className="text-gray-600 mb-6">
            Fill out the form to customize your fitness experience.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Gender */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">Gender</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="your_gender"
                    value="Male"
                    checked={formData.your_gender === "Male"}
                    onChange={handleChange}
                  />
                  Male
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="your_gender"
                    value="Female"
                    checked={formData.your_gender === "Female"}
                    onChange={handleChange}
                  />
                  Female
                </label>
              </div>
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Height */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Primary Goal for Exercising */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">Primary Goal for Exercising</label>
              <select
                name="primary_goal_for_exercising"
                value={formData.primary_goal_for_exercising}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Lose weight">Lose weight</option>
                <option value="Build muscle">Build muscle</option>
                <option value="Stay fit">Stay fit</option>
              </select>
            </div>

            {/* How Often Exercised in the Past */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">
                How Often Exercised in the Past
              </label>
              <select
                name="how_often_exercised_at_past"
                value={formData.how_often_exercised_at_past}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Never">Never</option>
                <option value="Rarely">Rarely</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Often">Often</option>
              </select>
            </div>

            {/* Workout Intensity */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">Workout Intensity</label>
              <select
                name="workout_intensity"
                value={formData.workout_intensity}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Workout Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">Workout Duration</label>
              <select
                name="workout_duration"
                value={formData.workout_duration}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="60 minutes">60 minutes</option>
              </select>
            </div>

            {/* Workout Days */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">
                What Days a Week Will You Workout?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="what_days_a_week_you_will_workout"
                      value={day}
                      checked={formData.what_days_a_week_you_will_workout.includes(
                        day
                      )}
                      onChange={handleChange}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            {/* Workout Time of Day */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700">
                What Time of Day Will You Workout?
              </label>
              <select
                name="what_time_of_day_you_will_workout"
                value={formData.what_time_of_day_you_will_workout}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}