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

export default function BicepCurls() {
  const [poseData, setPoseData] = useState([]);
  const [counter, setCounter] = useState(0);
  const [stage, setStage] = useState("down");
  const [currentAngle, setCurrentAngle] = useState(0);
  const [sets, setSets] = useState(0);
  const [targetSets] = useState(1);
  const [targetReps] = useState(4);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const exerciseStateRef = useRef({
    isUp: false,
    isDown: true,
    lastProcessedAngle: 0,
    repInProgress: false,
  });

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);

  const processExercise = (landmarks) => {
    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

    if (!shoulder || !elbow || !wrist) return;

    const angle = calculateAngle(shoulder, elbow, wrist);
    setCurrentAngle(Math.round(angle));

    const { isDownPosition, isUpPosition } = bicepCurlClassifier({
      armAngle: angle,
    });
    const state = exerciseStateRef.current;

    // Handle down position
    if (isDownPosition && !state.isDown) {
      state.isDown = true;
      state.isUp = false;
      state.repInProgress = false;
      setStage("down");
    }

    // Handle up position and rep counting
    if (isUpPosition && state.isDown && !state.isUp && !state.repInProgress && !workoutComplete) {
      state.isUp = true;
      state.isDown = false;
      state.repInProgress = true;
      setStage("up");
      
      setCounter(prevCounter => {
        const nextCount = prevCounter + 1;
        console.log(`Rep ${nextCount} completed`);
        
        if (nextCount === targetReps) {
          setSets(prevSets => {
            const nextSet = prevSets + 1;
            console.log(`Set ${nextSet} completed!`);
            
            if (nextSet === targetSets) {
              setWorkoutComplete(true);
              console.log('Workout Complete!', {
                exercise: 'Bicep Curls',
                completedSets: nextSet,
                totalReps: nextSet * targetReps,
                score: Math.round((nextSet / targetSets) * 100)
              });
              return nextSet;
            } else {
              // Reset counter for next set
              setTimeout(() => setCounter(0), 0);
              console.log(`Starting Set ${nextSet + 1}`);
              return nextSet;
            }
          });
        }
        return nextCount;
      });
    }
  };

  const startCapture = async () => {
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
    requestAnimationFrame(startCapture);
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
      exerciseStateRef.current = {
        isUp: false,
        isDown: true,
        lastProcessedAngle: 0,
        repInProgress: false,
      };
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
      });
    }
  }, [poseData, counter, stage, currentAngle]);

  const checkWorkoutProgress = () => {
    console.log({
      currentRep: counter + 1,
      currentSet: sets + 1,
      targetReps,
      targetSets
    });

    if (counter + 1 >= targetReps) {
      const nextSet = sets + 1;
      setSets(nextSet);
      setCounter(0);
      
      if (nextSet >= targetSets) {
        setWorkoutComplete(true);
        console.log('Workout Complete!', {
          exercise: 'Bicep Curls',
          completedSets: nextSet,
          totalReps: nextSet * targetReps,
          score: Math.round((nextSet / targetSets) * 100)
        });
      } else {
        console.log(`Set ${nextSet} completed! Starting next set...`);
      }
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
        <p>Set: {sets + 1}/{targetSets}</p>
        <p>Reps: {counter}/{targetReps}</p>
      </div>
      {/* Add workout complete message */}
      {workoutComplete && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-green-500 text-white p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Workout Complete! 🎉</h2>
          <p>Great job completing all {targetSets} sets!</p>
        </div>
      )}
    </div>
  );
}
