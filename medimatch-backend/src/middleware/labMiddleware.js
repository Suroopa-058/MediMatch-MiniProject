const jwt = require('jsonwebtoken');

// Same pattern as verifyToken, but confirms the token belongs to a lab
// specifically — prevents a patient or doctor token from being used to
// hit lab-only endpoints even if they somehow got a valid JWT.
const verifyLabToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'lab') {
      return res.status(403).json({ message: 'Access denied — lab account required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { verifyLabToken };