const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userType = decoded.userType; // 'buyer' or 'seller'
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const verifySellerToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userType !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can access this' });
    }
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyToken, verifySellerToken };
