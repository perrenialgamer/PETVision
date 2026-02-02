export const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({
    success: false,
    error: err.message,
  });
};
