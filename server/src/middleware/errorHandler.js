const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  
  if (err.message.includes('Validation error')) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes('Item not found')) {
    return res.status(404).json({ error: err.message });
  }

  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
};

module.exports = errorHandler;
