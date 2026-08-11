export const healthCheck = async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Server is running 🔥🔥",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const ping = async (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Pong",
  });
};