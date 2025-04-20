const getISTDate = () => {
  const options = {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const istDate = new Date().toLocaleDateString("en-GB", options); // en-GB gives DD-MM-YYYY format
  return istDate;
};

export { getISTDate };