"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BicepCurls from "../../components/workouts/BicepCurls";
import PushUps from "../../components/workouts/PushUps";
import Squats from "../../components/workouts/Squats";
import Crunches from "../../components/workouts/Crunches";
import { motion } from "framer-motion";

export default function LiveWorkout() {
  const [selectedWorkout, setSelectedWorkout] = useState("bicepCurls");
  const router = useRouter();

  const renderWorkout = () => {
    switch (selectedWorkout) {
      case "bicepCurls":
        return <BicepCurls />;
      case "pushUps":
        return <PushUps />;
      case "squats":
        return <Squats />;
      case "crunches":
        return <Crunches />;
      default:
        return <BicepCurls />;
    }
  };

  // Define workout options with icons
  const workoutOptions = [
    {
      id: "bicepCurls",
      label: "Bicep Curls",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
    },
    {
      id: "pushUps",
      label: "Push Ups",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.707.293l1 1a1 1 0 01-1.414 1.414L10 5.414 8.707 6.707a1 1 0 01-1.414-1.414l1-1A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "squats",
      label: "Squats",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "crunches",
      label: "Crunches",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen bg-gray-900 bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Live Workout Session
        </span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8 flex gap-4 flex-wrap justify-center"
      >
        {workoutOptions.map((workout, index) => (
          <motion.button
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className={`px-6 py-3 rounded-lg text-white font-medium text-lg transition-all duration-300 flex items-center gap-2 shadow-lg
              ${
                selectedWorkout === workout.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-105 shadow-xl shadow-blue-900/20"
                  : "bg-gray-800 hover:bg-gray-700 active:scale-95"
              }`}
            onClick={() => setSelectedWorkout(workout.id)}
          >
            <span className="text-purple-400">{workout.icon}</span>
            {workout.label}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative max-w-4xl w-full bg-gray-800/80 p-6 rounded-lg border border-gray-700/50 shadow-xl backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none"></div>
        <div className="relative z-10">{renderWorkout()}</div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 px-6 py-3 relative overflow-hidden bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg hover:from-red-500 hover:to-purple-500 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-md shadow-red-900/20 group"
        onClick={() => router.push("/home")}
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span className="relative z-10 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <a href="/home">Return to Home</a>
        </span>
      </motion.button>
    </motion.main>
  );
}
