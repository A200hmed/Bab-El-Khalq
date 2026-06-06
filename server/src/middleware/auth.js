require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.slice(7);
  
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Invalid admin secret' });
  }

  next();
};

module.exports = authMiddleware;
