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
  squatClassifier,
} from "../../lib/landmarkUtils";

export default function Squats() {
  const [poseData, setPoseData] = useState([]);
  const [counter, setCounter] = useState(0);
  const [stage, setStage] = useState("up");
  const [feedback, setFeedback] = useState("Fix Form");
  const [currentAngles, setCurrentAngles] = useState({
    shoulderHipKnee: 0,
    hipKneeAnkle: 0,
  });

  const exerciseStateRef = useRef({
    isUp: true,
    isDown: false,
    properForm: true,
  });

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);

  const processExercise = (landmarks) => {
    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const knee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const ankle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    if (!shoulder || !hip || !knee || !ankle) return;

    const shoulderHipKnee = calculateAngle(shoulder, hip, knee);
    const hipKneeAnkle = calculateAngle(hip, knee, ankle);

    setCurrentAngles({
      shoulderHipKnee: Math.round(shoulderHipKnee),
      hipKneeAnkle: Math.round(hipKneeAnkle),
    });

    const { isStandingPosition, isSquattingPosition, isProperForm } =
      squatClassifier({
        shoulderHipKnee,
        hipKneeAnkle,
      });

    const state = exerciseStateRef.current;

    // Form feedback
    if (!isProperForm) {
      setFeedback("Squat Lower");
    } else {
      setFeedback("Good Form");
    }

    // Counter logic
    if (isStandingPosition) {
      setStage("up");
      if (state.isDown) {
        setCounter((prev) => prev + 1);
        state.isDown = false;
      }
      state.isUp = true;
    }

    if (isSquattingPosition && state.isUp) {
      setStage("down");
      state.isDown = true;
      state.isUp = false;
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
        const hipPoint = landmarks[POSE_LANDMARKS.LEFT_HIP];
        if (hipPoint) {
          const x = (1 - hipPoint.x) * 1280; // Correct for mirroring
          const y = hipPoint.y * 720;
          ctx.font = "24px Arial";
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          ctx.lineWidth = 2;
          ctx.strokeText(`Hip: ${currentAngles.hipKneeAnkle}°`, x, y);
          ctx.fillText(`Hip: ${currentAngles.hipKneeAnkle}°`, x, y);
        }

        // Draw counter box and feedback
        ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
        ctx.fillRect(0, 0, 225, 120);

        // Draw rep counter
        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(counter.toString(), 15, 65);

        // Draw stage
        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("STAGE:", 15, 90);
        ctx.fillStyle = "white";
        ctx.fillText(stage, 90, 90);

        // Draw feedback
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("FORM:", 15, 110);
        ctx.fillStyle = feedback === "Good Form" ? "#00FF00" : "#FF0000";
        ctx.fillText(feedback, 70, 110);

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
