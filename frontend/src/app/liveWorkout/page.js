"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BicepCurls from "../../components/workouts/BicepCurls";
import PushUps from "../../components/workouts/PushUps";
import Squats from "../../components/workouts/Squats";
import Crunches from "../../components/workouts/Crunches";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowLeft, ChevronUp, MoveDown, Plus } from "lucide-react";

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
      icon: <Dumbbell className="h-5 w-5" />,
      color: "from-blue-500 to-indigo-600",
      hoverColor: "group-hover:from-blue-400 group-hover:to-indigo-500",
    },
    {
      id: "pushUps",
      label: "Push Ups",
      icon: <ChevronUp className="h-5 w-5" />,
      color: "from-purple-500 to-violet-600",
      hoverColor: "group-hover:from-purple-400 group-hover:to-violet-500",
    },
    {
      id: "squats",
      label: "Squats",
      icon: <MoveDown className="h-5 w-5" />,
      color: "from-indigo-500 to-blue-600",
      hoverColor: "group-hover:from-indigo-400 group-hover:to-blue-500",
    },
    {
      id: "crunches",
      label: "Crunches",
      icon: <Plus className="h-5 w-5" />,
      color: "from-violet-500 to-purple-600",
      hoverColor: "group-hover:from-violet-400 group-hover:to-purple-500",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { 
        duration: 0.2 
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
        <div className="absolute w-1/3 h-2/3 left-0 top-1/4 bg-gradient-to-r from-purple-900/10 to-transparent"></div>
        <div className="absolute w-full h-1/4 bottom-0 bg-gradient-to-t from-purple-900/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Live Workout Session
            </span>
          </motion.h1>
          <motion.p
            className="text-gray-400 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Select a workout below to begin your training session with real-time tracking and feedback.
          </motion.p>
        </motion.div>

        {/* Workout Selection */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <div className="hidden md:block">
            <Tabs 
              value={selectedWorkout} 
              onValueChange={setSelectedWorkout}
              className="w-full mx-auto flex flex-col md:items-center"
            >
              <TabsList className="grid grid-cols-4 mb-8 h-16 p-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
                {workoutOptions.map((workout) => (
                  <TabsTrigger
                    key={workout.id}
                    value={workout.id}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-purple-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 h-full rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      {workout.icon}
                      <span>{workout.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Mobile workout options */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {workoutOptions.map((workout, index) => (
              <motion.button
                key={workout.id}
                variants={cardVariants}
                className={`group relative px-4 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 shadow-md transition-all duration-300
                  ${selectedWorkout === workout.id
                    ? `bg-gradient-to-r ${workout.color} scale-105 shadow-lg`
                    : "bg-gray-800/70 border border-gray-700/30 hover:bg-gray-700/90"
                  }`}
                onClick={() => setSelectedWorkout(workout.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${workout.color} opacity-0 ${selectedWorkout !== workout.id ? workout.hoverColor : ""} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
                <span className={`${selectedWorkout === workout.id ? "text-white" : "text-purple-400"}`}>
                  {workout.icon}
                </span>
                <span className="text-sm md:text-base">{workout.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Workout Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedWorkout}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="mb-10"
          >
            <Card className="relative overflow-hidden border-gray-700/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/5 pointer-events-none"></div>
              
              {/* Glowing corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-transparent rounded-br-full blur-xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-tl-full blur-xl"></div>
              
              <CardContent className="p-6 md:p-8 relative z-10">
                {renderWorkout()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Return button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            className="group relative overflow-hidden bg-gradient-to-r from-red-600/80 to-purple-600/80 border-none text-white py-6 px-8 rounded-xl hover:shadow-lg hover:shadow-red-900/20 transition-all duration-300"
            onClick={() => router.push("/home")}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="flex items-center gap-3">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              Return to Home
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}