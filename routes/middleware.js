//check if user is authenticated 

const jwt = require('jsonwebtoken'); 

function requireToken (req, res, next) {
    const authHeader = req.headers.authorization; 
    if (!authHeader) return res.status(401).json({error: 'Missing Token' }); 

    const token = authHeader.split(' ') [1]; 
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); 
        req.user = decoded; 
        next(); 
      } catch (err) {
        res.status(403).json({error: 'Invalid token' }); 


      }


}

module.exports = requireToken
