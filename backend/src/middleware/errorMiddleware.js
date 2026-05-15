export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorMiddleware = (error, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(' ');
  }

  if (error.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(error.keyValue || {})[0] || 'field';
    message = `An account with this ${duplicatedField} already exists.`;
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};
