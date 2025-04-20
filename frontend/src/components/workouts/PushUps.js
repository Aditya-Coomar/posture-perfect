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
  pushUpClassifier,
} from "../../lib/landmarkUtils";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { getISTDate } from "@/functions/utils";

export default function PushUps() {
  const [poseData, setPoseData] = useState([]);
  const [counter, setCounter] = useState(0);
  const [stage, setStage] = useState("up");
  const [feedback, setFeedback] = useState("Get in position");
  const [currentAngles, setCurrentAngles] = useState({
    elbow: 0,
    shoulder: 0,
    hip: 0,
  });
  const [sets, setSets] = useState(0);
  const [targetSets] = useState(1);
  const [targetReps] = useState(4);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const [formQuality, setFormQuality] = useState("poor"); // poor, fair, good

  // Create a ref to handle animation frame
  const animationFrameRef = useRef(null);

  // Reference values for proper push-up form based on research
  const FORM_REFERENCES = {
    // At top position (extended arms)
    topPosition: {
      elbow: { min: 160, ideal: 175 },
      shoulder: { min: 35, ideal: 45 },
      hip: { min: 160, ideal: 175 },
    },
    // At bottom position (flexed arms)
    bottomPosition: {
      elbow: { min: 70, max: 110, ideal: 90 },
      shoulder: { min: 0, max: 45, ideal: 30 },
      hip: { min: 160, ideal: 175 }, // Hip should remain straight throughout
    },
  };

  // Use ref to track state to avoid closure issues
  const stateRef = useRef({
    counter: 0,
    sets: 0,
    stage: "up",
    isUp: true,
    isDown: false,
    repInProgress: false,
    // Angle thresholds - refined based on research
    elbowAngleThresholdUp: 155, // Minimum angle for up position (nearly straight arms)
    elbowAngleThresholdDown: 110, // Maximum angle for down position (bent arms)
    // Body alignment checks
    hipAngleThreshold: 150, // Minimum angle for straight body alignment (prevent sagging)
    shoulderAlignmentThreshold: 30, // For checking shoulder position relative to wrists
    // Detection stability
    lastDetectedElbowAngle: 0,
    lastDetectedShoulderAngle: 0,
    lastDetectedHipAngle: 0,
    consecutiveFramesInPosition: 0,
    minFramesForDetection: 5, // Minimum frames to confirm a position
    repComplete: false, // Flag to prevent multiple counts for same rep
    // Depth tracking
    deepestElbowAngle: 180, // Track depth of push-up
    formQualityCounter: 0, // Count frames with good form
    badFormCounter: 0, // Count frames with bad form
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
      exercise: "Pushups",
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

    // Calculate score based on sets, reps and form quality (0-100)
    const formMultiplier =
      formQuality === "good" ? 1.0 : formQuality === "fair" ? 0.85 : 0.7;

    const finalScore = Math.round(targetSets * 100 * formMultiplier);

    console.log("Workout Complete!", {
      exercise: "Push Ups",
      completedSets: targetSets,
      totalReps: targetSets * targetReps,
      formQuality: formQuality,
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

    // Update form quality based on accumulated counters
    const formRatio =
      stateRef.current.formQualityCounter /
      (stateRef.current.formQualityCounter +
        stateRef.current.badFormCounter +
        1);

    const newFormQuality =
      formRatio > 0.8 ? "good" : formRatio > 0.5 ? "fair" : "poor";

    setFormQuality(newFormQuality);

    console.log(
      `Set ${newSets} completed! (${newSets}/${targetSets}) - Form quality: ${newFormQuality}`
    );

    if (newSets >= targetSets) {
      setTimeout(() => completeWorkout(), 500);
    } else {
      // Reset for next set
      setTimeout(() => {
        setStage("up");
        stateRef.current.stage = "up";
        stateRef.current.isUp = true;
        stateRef.current.isDown = false;
        stateRef.current.repComplete = false;
        stateRef.current.deepestElbowAngle = 180;
        stateRef.current.formQualityCounter = 0;
        stateRef.current.badFormCounter = 0;
      }, 1000);
    }
  };

  const assessPushupForm = (elbowAngle, shoulderAngle, hipAngle) => {
    const state = stateRef.current;
    let formFeedback = "";
    let isGoodForm = false;

    // Check body alignment (hip angle should remain straight throughout push-up)
    if (hipAngle < state.hipAngleThreshold) {
      formFeedback = "Keep your body straight";
      state.badFormCounter++;
    }
    // Check elbow angle based on current stage
    else if (state.stage === "up" && elbowAngle < state.elbowAngleThresholdUp) {
      formFeedback = "Extend arms fully";
      state.badFormCounter++;
    } else if (
      state.stage === "down" &&
      elbowAngle > state.elbowAngleThresholdDown
    ) {
      formFeedback = "Lower your body more";
      state.badFormCounter++;
    }
    // Look good, provide encouragement
    else {
      if (state.stage === "up") {
        formFeedback = "Good position, lower down";
        isGoodForm = true;
        state.formQualityCounter++;
      } else {
        formFeedback = "Good depth, push up";
        isGoodForm = true;
        state.formQualityCounter++;
      }
    }

    return { formFeedback, isGoodForm };
  };

  const processExercise = (landmarks) => {
    if (workoutComplete || !isDetecting) return;

    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const knee = landmarks[POSE_LANDMARKS.LEFT_KNEE];

    if (!shoulder || !elbow || !wrist || !hip || !knee) return;

    // Calculate key angles
    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const shoulderAngle = calculateAngle(hip, shoulder, elbow);
    const hipAngle = calculateAngle(shoulder, hip, knee);

    setCurrentAngles({
      elbow: Math.round(elbowAngle),
      shoulder: Math.round(shoulderAngle),
      hip: Math.round(hipAngle),
    });

    const state = stateRef.current;

    // Track deepest position for depth feedback
    if (elbowAngle < state.deepestElbowAngle) {
      state.deepestElbowAngle = elbowAngle;
    }

    // Determine if we're in up or down position
    const isUpPosition = elbowAngle > state.elbowAngleThresholdUp;
    const isDownPosition = elbowAngle < state.elbowAngleThresholdDown;

    // Implement stable detection with consecutive frames
    if (
      Math.abs(elbowAngle - state.lastDetectedElbowAngle) > 10 ||
      Math.abs(hipAngle - state.lastDetectedHipAngle) > 10
    ) {
      state.consecutiveFramesInPosition = 0;
    } else {
      state.consecutiveFramesInPosition++;
    }

    // Update last detected angles
    state.lastDetectedElbowAngle = elbowAngle;
    state.lastDetectedShoulderAngle = shoulderAngle;
    state.lastDetectedHipAngle = hipAngle;

    // Basic form check
    const { formFeedback, isGoodForm } = assessPushupForm(
      elbowAngle,
      shoulderAngle,
      hipAngle
    );
    setFeedback(formFeedback);

    // Only process state changes when we have enough consistent frames
    if (state.consecutiveFramesInPosition >= state.minFramesForDetection) {
      // Handle up position - starting position or completed rep
      if (isUpPosition && state.stage !== "up") {
        state.isUp = true;
        state.isDown = false;
        state.repComplete = false;
        setStage("up");
        state.stage = "up";

        if (state.repInProgress) {
          // Increment counter only if we were tracking a rep (to avoid starting in up position)
          const newCounter = state.counter + 1;
          setCounter(newCounter);
          state.counter = newCounter;
          console.log(
            `Rep ${newCounter} completed (${newCounter}/${targetReps})`
          );

          // Check if we've completed all reps for this set
          if (newCounter >= targetReps) {
            completeSet();
          }

          state.repInProgress = false;
          state.deepestElbowAngle = 180; // Reset depth tracker
        }
      }

      // Handle down position - mid rep
      if (isDownPosition && state.stage === "up" && !state.repComplete) {
        state.isDown = true;
        state.isUp = false;
        state.repComplete = true;
        setStage("down");
        state.stage = "down";
        state.repInProgress = true; // Mark that a rep is in progress
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

          // Draw angles on key joints
          const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
          const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];

          if (elbow) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            const x = (1 - elbow.x) * 1280;
            const y = elbow.y * 720;
            ctx.strokeText(`E: ${currentAngles.elbow}°`, x, y);
            ctx.fillText(`E: ${currentAngles.elbow}°`, x, y);
          }

          if (hip) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            const x = (1 - hip.x) * 1280;
            const y = hip.y * 720;
            ctx.strokeText(`H: ${currentAngles.hip}°`, x, y);
            ctx.fillText(`H: ${currentAngles.hip}°`, x, y);
          }

          // Draw counter box
          ctx.fillStyle = "rgba(245, 117, 16, 0.7)";
          ctx.fillRect(0, 0, 225, 160);

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

          ctx.font = "30px Arial";
          ctx.fillStyle = "white";
          ctx.fillText(stage, 120, 65);

          // Draw feedback
          ctx.font = "16px Arial";
          ctx.fillStyle = "black";
          ctx.fillText("FEEDBACK", 15, 90);

          ctx.font = "16px Arial";
          ctx.fillStyle = "white";
          ctx.fillText(feedback, 15, 110);

          // Draw form quality
          ctx.font = "16px Arial";
          ctx.fillStyle = "black";
          ctx.fillText("FORM", 15, 130);

          ctx.font = "16px Arial";
          const formColor =
            formQuality === "good"
              ? "#00FF00"
              : formQuality === "fair"
              ? "#FFCC00"
              : "#FF0000";
          ctx.fillStyle = formColor;
          ctx.fillText(formQuality.toUpperCase(), 15, 150);

          // Draw depth indicator (when in down position)
          if (stage === "down") {
            const depthPercentage = Math.max(
              0,
              Math.min(100, ((180 - currentAngles.elbow) / 90) * 100)
            );
            const barWidth = 20;
            const barHeight = 200;
            const barX = 580;
            const barY = 100;

            // Background bar
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Progress bar
            ctx.fillStyle = depthPercentage > 70 ? "#00FF00" : "#FFCC00";
            ctx.fillRect(
              barX,
              barY + barHeight - (depthPercentage / 100) * barHeight,
              barWidth,
              (depthPercentage / 100) * barHeight
            );

            // Label
            ctx.font = "16px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("DEPTH", barX - 60, barY + barHeight + 20);
            ctx.fillText(
              `${Math.round(depthPercentage)}%`,
              barX - 40,
              barY + barHeight + 40
            );
          }

          ctx.restore();
        }
      });
    }
  }, [
    poseData,
    counter,
    stage,
    feedback,
    currentAngles,
    isDetecting,
    formQuality,
  ]);

  const resetWorkout = () => {
    setWorkoutComplete(false);
    setIsDetecting(true);
    setCounter(0);
    setSets(0);
    setStage("up");
    setFeedback("Get in position");
    setFormQuality("poor");

    // Reset all state tracking
    stateRef.current = {
      counter: 0,
      sets: 0,
      stage: "up",
      isUp: true,
      isDown: false,
      repInProgress: false,
      elbowAngleThresholdUp: 155,
      elbowAngleThresholdDown: 110,
      hipAngleThreshold: 150,
      shoulderAlignmentThreshold: 30,
      lastDetectedElbowAngle: 0,
      lastDetectedShoulderAngle: 0,
      lastDetectedHipAngle: 0,
      consecutiveFramesInPosition: 0,
      minFramesForDetection: 5,
      repComplete: false,
      deepestElbowAngle: 180,
      formQualityCounter: 0,
      badFormCounter: 0,
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
        <p className="mt-2">
          Form Quality:{" "}
          <span
            className={
              formQuality === "good"
                ? "text-green-400"
                : formQuality === "fair"
                ? "text-yellow-400"
                : "text-red-400"
            }
          >
            {formQuality.toUpperCase()}
          </span>
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
          <p className="mt-2">
            Form Quality:{" "}
            <span
              className={
                formQuality === "good"
                  ? "font-bold"
                  : formQuality === "fair"
                  ? "italic"
                  : "opacity-80"
              }
            >
              {formQuality.toUpperCase()}
            </span>
          </p>
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
