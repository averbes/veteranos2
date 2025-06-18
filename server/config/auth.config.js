require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'torneo-veteranos-secret-key',
    expiresIn: '24h',
  },
  refreshToken: {
    expiresIn: '7d',
  },
  roles: {
    ADMIN: 'admin',
    USER: 'user',
  },
};
