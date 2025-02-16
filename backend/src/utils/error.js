export const errorHandler = (statusCode, message, res) => {
  if (res) return res.status(statusCode).json({ error: message });
  const error = new Error();
  error.statusCode = statusCode;
  error.message = message;
  return error;
};
