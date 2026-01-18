const session = require("express-session");

module.exports = session({
  secret: "aarogyam-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour
  }
});
