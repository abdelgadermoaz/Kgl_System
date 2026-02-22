import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  // 1. Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user data (id, role, name) to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    // 3. Check if the user's role is included in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};