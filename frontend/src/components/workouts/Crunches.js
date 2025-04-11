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
  crunchClassifier,
} from "../../lib/landmarkUtils";

export default function Crunches() {
  const [poseData, setPoseData] = useState([]);
  const [counter, setCounter] = useState(0);
  const [stage, setStage] = useState("down");
  const [feedback, setFeedback] = useState("Start");
  const [currentAngle, setCurrentAngle] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const exerciseStateRef = useRef({
    direction: 0, // 0 for down, 1 for up
  });

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);

  const processExercise = (landmarks) => {
    const shoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const hip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const knee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];

    if (!shoulder || !hip || !knee) return;

    const shoulderAngle = calculateAngle(knee, hip, shoulder);
    setCurrentAngle(Math.round(shoulderAngle));

    // Calculate percentage using the same logic as Python code
    // Map shoulder angle from (117, 114) to (100, 0)
    const per = Math.round(((117 - shoulderAngle) / (117 - 114)) * 100);

    // Clamp percentage between 0 and 100
    const clampedPer = Math.max(0, Math.min(100, per));
    setPercentage(clampedPer);

    const state = exerciseStateRef.current;

    // Crunch counter logic matching Python implementation
    if (clampedPer >= 95) {
      // Using 95 instead of exact 100 for better detection
      setFeedback("Up");
      if (state.direction === 0) {
        setCounter((prev) => prev + 0.5);
        state.direction = 1;
        setStage("up");
      }
    }

    if (clampedPer <= 5) {
      // Using 5 instead of exact 0 for better detection
      setFeedback("Down");
      if (state.direction === 1) {
        setCounter((prev) => prev + 0.5);
        state.direction = 0;
        setStage("down");
      }
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
        direction: 0,
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

        // Draw angle at hip position (matching Python visualization)
        const hip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
        if (hip) {
          const x = hip.x * 1280;
          const y = hip.y * 720;
          ctx.font = "24px Arial";
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          ctx.lineWidth = 2;
          ctx.strokeText(`${currentAngle}°`, x, y);
          ctx.fillText(`${currentAngle}°`, x, y);
        }

        // Draw counter box (matching Python style)
        ctx.fillStyle = "rgba(0, 0, 255, 0.7)";
        ctx.fillRect(0, 380, 130, 100);

        // Draw counter
        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(Math.floor(counter).toString(), 25, 455);

        // Draw feedback
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(feedback, 750, 450);

        ctx.restore();
      });
    }
  }, [poseData, counter, stage, feedback, currentAngle, percentage]);

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
