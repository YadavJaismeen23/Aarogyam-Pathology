const session = require('express-session');

module.exports = session({
  secret: process.env.SESSION_SECRET || 'aarogyam-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
});
