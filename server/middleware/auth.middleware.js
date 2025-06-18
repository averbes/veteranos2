const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../database');

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!',
    });
  }

  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!',
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole === config.roles.ADMIN) {
    next();
    return;
  }

  res.status(403).send({
    message: 'Require Admin Role!',
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
};

module.exports = authJwt;
