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

export default function PushUps() {
  const [poseData, setPoseData] = useState([]);
  const [counter, setCounter] = useState(0);
  const [stage, setStage] = useState("up");
  const [feedback, setFeedback] = useState("Fix Form");
  const [currentAngles, setCurrentAngles] = useState({ elbow: 0, shoulder: 0 });

  const exerciseStateRef = useRef({
    isUp: false,
    isDown: true,
    properForm: false,
  });

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);

  const processExercise = (landmarks) => {
    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];

    if (!shoulder || !elbow || !wrist || !hip) return;

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const shoulderAngle = calculateAngle(hip, shoulder, elbow);

    setCurrentAngles({
      elbow: Math.round(elbowAngle),
      shoulder: Math.round(shoulderAngle),
    });

    const state = exerciseStateRef.current;

    // Form checking
    if (shoulderAngle > 30) {
      state.properForm = true;

      // Top position
      if (elbowAngle > 150) {
        setStage("up");
        setFeedback("Lower Down");
        if (!state.isUp && state.isDown) {
          setCounter((prev) => prev + 0.5);
          state.isUp = true;
          state.isDown = false;
        }
      }
      // Bottom position
      else if (elbowAngle < 90) {
        setStage("down");
        setFeedback("Push Up");
        if (state.isUp && !state.isDown) {
          setCounter((prev) => prev + 0.5);
          state.isUp = false;
          state.isDown = true;
        }
      }
      // Mid-motion
      else {
        setFeedback(state.isDown ? "Push Up" : "Lower Down");
      }
    } else {
      state.properForm = false;
      setFeedback("Keep your core tight");
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
        isUp: true,
        isDown: false,
        repInProgress: false,
        properForm: false,
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
        // Draw landmarks and connections
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

        // Draw angles
        const elbowPoint = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
        if (elbowPoint) {
          ctx.font = "24px Arial";
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          ctx.lineWidth = 2;
          const x = elbowPoint.x * 1280;
          const y = elbowPoint.y * 720;
          ctx.strokeText(`E: ${currentAngles.elbow}°`, x, y);
          ctx.fillText(`E: ${currentAngles.elbow}°`, x, y);
        }

        // Draw counter box and feedback
        ctx.fillStyle = "rgba(245, 117, 16, 0.7)";
        ctx.fillRect(0, 0, 225, 120);

        // Draw rep counter
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("REPS", 15, 25);

        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(Math.floor(counter).toString(), 15, 65);

        // Draw feedback
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("FEEDBACK", 15, 90);
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(feedback, 15, 110);

        // Draw progress bar
        const barX = 580;
        const barY = 50;
        const barWidth = 20;
        const barHeight = 330;

        // Background bar
        ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress bar
        const progress = Math.max(
          0,
          Math.min(100, ((currentAngles.elbow - 90) / (160 - 90)) * 100)
        );
        const progressHeight = (progress / 100) * barHeight;

        ctx.fillStyle = "rgba(0, 255, 0, 1)";
        ctx.fillRect(
          barX,
          barY + barHeight - progressHeight,
          barWidth,
          progressHeight
        );

        // Percentage text
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(
          `${Math.round(progress)}%`,
          barX - 40,
          barY + barHeight + 30
        );

        ctx.restore();
      });
    }
  }, [poseData, counter, stage, feedback, currentAngles]);

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
    </div>
  );
}
