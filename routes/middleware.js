//check if user is authenticated 

const jwt = require('jsonwebtoken'); 

function requireToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });
  
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: "Malformed Authorization header" });
    }
  
    const token = parts[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
  
 // middleware/requireAdmin.js
function requireAdmin(req, res, next) {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).send({ error: "Admin access only" });
  }
}

  

module.exports = {
  requireToken,
  requireAdmin,
};

