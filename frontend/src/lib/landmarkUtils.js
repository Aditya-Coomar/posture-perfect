export const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  LEFT_ELBOW: 13,
  LEFT_WRIST: 15,
  RIGHT_SHOULDER: 12,
  RIGHT_ELBOW: 14,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  RIGHT_KNEE: 26,
  LEFT_KNEE: 25,
  LEFT_ANKLE: 27,
};

export const calculateAngle = (a, b, c) => {
  const angle =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);

  let angleInDegrees = Math.abs((angle * 180.0) / Math.PI);

  if (angleInDegrees > 180.0) {
    angleInDegrees = 360 - angleInDegrees;
  }

  return angleInDegrees;
};

export const bicepCurlClassifier = (angles) => {
  const { armAngle } = angles;

  // Define exercise states
  const isDownPosition = armAngle > 160;
  const isUpPosition = armAngle < 30;

  return {
    isDownPosition,
    isUpPosition,
    exerciseName: "Bicep Curl",
  };
};

export const pushUpClassifier = (angles) => {
  const { elbowAngle, shoulderAngle } = angles;

  // Define exercise states based on angles
  const isDownPosition = elbowAngle <= 90;
  const isUpPosition = elbowAngle > 160 && shoulderAngle > 40;
  const isProperForm = shoulderAngle > 40;

  return {
    isDownPosition,
    isUpPosition,
    isProperForm,
    exerciseName: "Push Up",
  };
};

export const crunchClassifier = (angles) => {
  const { shoulderAngle } = angles;

  // Define exercise states based on angles
  // Using shoulder angle between hip and knee as main indicator
  const isDownPosition = shoulderAngle > 117;
  const isUpPosition = shoulderAngle < 114;

  return {
    isDownPosition,
    isUpPosition,
    exerciseName: "Crunch",
  };
};

export const squatClassifier = (angles) => {
  const { shoulderHipKnee, hipKneeAnkle } = angles;

  // Define exercise states based on angles
  const isStandingPosition = shoulderHipKnee > 170;
  const isSquattingPosition = hipKneeAnkle < 100;
  const isProperForm = hipKneeAnkle >= 80;

  return {
    isStandingPosition,
    isSquattingPosition,
    isProperForm,
    exerciseName: "Squat",
  };
};
