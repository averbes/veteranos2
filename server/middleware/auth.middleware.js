
const db = require('../database');

const verifyToken = (req, res, next) => {
  // JWT verification logic removed. 
  // This will allow requests to proceed without authentication.
  // Note that req.userId and req.userRole will not be set.
  next();
};

const isAdmin = (req, res, next) => {
  // Admin role check removed.
  // This will allow all users to access admin routes.
  next();
};

const authJwt = {
  verifyToken,
  isAdmin,
};

module.exports = authJwt;
