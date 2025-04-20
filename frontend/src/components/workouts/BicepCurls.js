"use client";
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  POSE_LANDMARKS,
  calculateAngle,
  bicepCurlClassifier,
} from "../../lib/landmarkUtils";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { getISTDate } from "@/functions/utils";

export default function BicepCurls() {
  const [poseData, setPoseData] = useState([]);
  const [counter, setCounter] = useState(0);
  const [stage, setStage] = useState("down");
  const [currentAngle, setCurrentAngle] = useState(0);
  const [sets, setSets] = useState(0);
  const [targetSets] = useState(1);
  const [targetReps] = useState(4);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  // Create a ref to handle animation frame
  const animationFrameRef = useRef(null);

  // Use ref to track state to avoid closure issues
  const stateRef = useRef({
    counter: 0,
    sets: 0,
    stage: "down",
    isUp: false,
    isDown: true,
    angleThresholdUp: 160, // Angle when arm is fully extended (down position)
    angleThresholdDown: 60, // Angle when arm is fully bent (up position)
    lastDetectedAngle: 0,
    consecutiveFramesInPosition: 0,
    minFramesForDetection: 5, // Minimum frames to confirm a position
    repComplete: false, // Flag to prevent multiple counts for same rep
  });

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);

  // Keep stateRef in sync with React state
  useEffect(() => {
    stateRef.current.counter = counter;
    stateRef.current.sets = sets;
    stateRef.current.stage = stage;
  }, [counter, sets, stage]);

  const updateScore = async (workoutScore) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

    const raw = JSON.stringify({
      date: getISTDate(),
      score: workoutScore,
      exercise: "Bicep Curls",
    });

    const requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://bursting-shepherd-promoted.ngrok-free.app/api/auth/leaderboard/update",
        requestOptions
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Score updated successfully!");
      } else {
        toast.error("Failed to update score.");
      }
    } catch (error) {
      console.error("Error updating score:", error);
      toast.error("Failed to update score.");
    }
  };

  const completeWorkout = () => {
    setWorkoutComplete(true);
    setIsDetecting(false);
    
    const finalScore = Math.round(targetSets * 100);
    console.log("Workout Complete!", {
      exercise: "Bicep Curls",
      completedSets: targetSets,
      totalReps: targetSets * targetReps,
      score: finalScore,
    });
    
    updateScore(finalScore);
    
    // Cancel animation frame when workout is complete
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const completeSet = () => {
    const newSets = stateRef.current.sets + 1;
    setSets(newSets);
    stateRef.current.sets = newSets;
    setCounter(0);
    stateRef.current.counter = 0;

    console.log(`Set ${newSets} completed! (${newSets}/${targetSets})`);
    
    if (newSets >= targetSets) {
      setTimeout(() => completeWorkout(), 500);
    } else {
      // Reset for next set
      setTimeout(() => {
        setStage("down");
        stateRef.current.stage = "down";
        stateRef.current.isUp = false;
        stateRef.current.isDown = true;
        stateRef.current.repComplete = false;
      }, 1000);
    }
  };

  const processExercise = (landmarks) => {
    if (workoutComplete || !isDetecting) return;

    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

    if (!shoulder || !elbow || !wrist) return;

    const angle = calculateAngle(shoulder, elbow, wrist);
    setCurrentAngle(Math.round(angle));

    const state = stateRef.current;
    const isUpPosition = angle <= state.angleThresholdDown;
    const isDownPosition = angle >= state.angleThresholdUp;

    // Implement a more stable detection with consecutive frames
    if (Math.abs(angle - state.lastDetectedAngle) > 5) {
      state.consecutiveFramesInPosition = 0;
    } else {
      state.consecutiveFramesInPosition++;
    }

    state.lastDetectedAngle = angle;

    // Only process state changes when we have enough consistent frames
    if (state.consecutiveFramesInPosition >= state.minFramesForDetection) {
      // Handle down position - reset for next rep
      if (isDownPosition && state.stage !== "down") {
        state.isDown = true;
        state.isUp = false;
        state.repComplete = false;
        setStage("down");
        state.stage = "down";
      }

      // Handle up position and rep counting
      if (isUpPosition && state.stage === "down" && !state.repComplete) {
        state.isUp = true;
        state.isDown = false;
        state.repComplete = true;
        setStage("up");
        state.stage = "up";

        // Increment counter
        const newCounter = state.counter + 1;
        setCounter(newCounter);
        state.counter = newCounter;
        console.log(`Rep ${newCounter} completed (${newCounter}/${targetReps})`);

        // Check if we've completed all reps for this set
        if (newCounter >= targetReps) {
          completeSet();
        }
      }
    }
  };

  const startCapture = async () => {
    if (!isDetecting) {
      return;
    }
    
    if (
      webcamRef.current &&
      poseLandmarkerRef.current &&
      webcamRef.current.video
    ) {
      const video = webcamRef.current.video;
      if (video.currentTime > 0) {
        try {
          const result = await poseLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );
          if (result.landmarks?.[0]) {
            setPoseData(result.landmarks);
            processExercise(result.landmarks[0]);
          }
        } catch (error) {
          console.error("Error in pose detection:", error);
        }
      }
    }
    // Store reference to the animation frame so we can cancel it later
    animationFrameRef.current = requestAnimationFrame(startCapture);
  };

  useEffect(() => {
    const initializePoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        poseLandmarkerRef.current = poseLandmarker;
        console.log("Pose landmarker is created!");
        startCapture();
      } catch (error) {
        console.error("Error initializing pose landmarker:", error);
      }
    };

    initializePoseLandmarker();

    return () => {
      // Cleanup animation frame on component unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      drawingUtilsRef.current = new DrawingUtils(ctx);
    }
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && drawingUtilsRef.current && poseData.length > 0) {
      ctx.clearRect(0, 0, 1280, 720);

      poseData.forEach((landmarks) => {
        // Only draw landmarks if detection is active
        if (isDetecting) {
          landmarks.forEach((point) => {
            drawingUtilsRef.current.drawLandmarks([point], {
              color: "#FF0000",
              radius: 5,
              lineWidth: 2,
            });
          });

          if (PoseLandmarker.POSE_CONNECTIONS) {
            drawingUtilsRef.current.drawConnectors(
              landmarks,
              PoseLandmarker.POSE_CONNECTIONS,
              {
                color: "#00FF00",
                lineWidth: 2,
              }
            );
          }

          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-1280, 0);

          const elbow = landmarks[13];
          if (elbow) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            const x = (1 - elbow.x) * 1280;
            const y = elbow.y * 720;
            ctx.strokeText(`${currentAngle}°`, x, y);
            ctx.fillText(`${currentAngle}°`, x, y);
          }

          // Draw counter box
          ctx.fillStyle = "rgba(245, 117, 16, 0.7)";
          ctx.fillRect(0, 0, 225, 73);

          // Draw rep counter
          ctx.font = "16px Arial";
          ctx.fillStyle = "black";
          ctx.fillText("REPS", 15, 25);

          ctx.font = "48px Arial";
          ctx.fillStyle = "white";
          ctx.fillText(counter.toString(), 15, 65);

          // Draw stage
          ctx.font = "16px Arial";
          ctx.fillStyle = "black";
          ctx.fillText("STAGE", 120, 25);

          ctx.font = "48px Arial";
          ctx.fillStyle = "white";
          ctx.fillText(stage, 120, 65);

          ctx.restore();
        }
      });
    }
  }, [poseData, counter, stage, currentAngle, isDetecting]);

  const resetWorkout = () => {
    setWorkoutComplete(false);
    setIsDetecting(true);
    setCounter(0);
    setSets(0);
    setStage("down");
    
    // Reset all state tracking
    stateRef.current = {
      counter: 0,
      sets: 0,
      stage: "down",
      isUp: false,
      isDown: true,
      angleThresholdUp: 160,
      angleThresholdDown: 60,
      lastDetectedAngle: 0,
      consecutiveFramesInPosition: 0,
      minFramesForDetection: 5,
      repComplete: false,
    };
    
    // Restart the capture if not running
    if (!animationFrameRef.current) {
      startCapture();
    }
  };

  return (
    <div className="relative w-full pt-[56.25%]">
      <Webcam
        width="1280"
        height="720"
        mirrored
        id="webcam"
        audio={false}
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: "user",
        }}
        ref={webcamRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      <canvas
        ref={canvasRef}
        width="1280"
        height="720"
        style={{ transform: "rotateY(180deg)" }}
        className="absolute top-0 left-0 w-full h-full"
      />
      {/* Add workout status overlay */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 p-4 rounded-lg text-white">
        <h3 className="text-xl font-bold mb-2">Workout Progress</h3>
        <p>
          Set: {sets + 1}/{targetSets}
        </p>
        <p>
          Reps: {counter}/{targetReps}
        </p>
        {workoutComplete && (
          <button 
            onClick={resetWorkout}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Start New Workout
          </button>
        )}
      </div>
      {/* Add workout complete message */}
      {workoutComplete && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-green-500 text-white p-6 rounded-lg text-center"
        >
          <h2 className="text-2xl font-bold mb-2">Workout Complete! 🎉</h2>
          <p>Great job completing all {targetSets} sets!</p>
          <button 
            onClick={resetWorkout}
            className="mt-4 bg-white text-green-500 py-2 px-4 rounded hover:bg-gray-100"
          >
            Start New Workout
          </button>
        </div>
      )}
    </div>
  );
}