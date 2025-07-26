const { verifyToken } = require('../utils/jwt');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(422).json({ message: 'Token missing' });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;  // Attach decoded token data to the request object

    // Optionally, check for a role in the decoded token if your JWT contains a "role" field
    // Example: { "user_id": 123, "role": "provider" }

    next(); // Pass control to the next middleware or route handler
  } catch (err) {
    return res.status(422).json({ message: 'Unauthenticated' });
  }
}

// Middleware to authorize users based on their role
function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user;  // Assuming "role" is included in the JWT token

    if (!allowedRoles.includes(role)) {
      return res.status(422).json({ message: 'Forbidden: You do not have the required role' });
    }

    next();  // Allow access to the route
  };
}

module.exports = { authenticateToken, authorizeRole };
