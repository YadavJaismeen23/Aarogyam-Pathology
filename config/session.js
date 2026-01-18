const session = require("express-session");

module.exports = session({
  name: "aarogyam.sid", // custom session cookie name
  secret: process.env.SESSION_SECRET || "aarogyam-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true only in HTTPS (Render will handle later)
    maxAge: 60 * 60 * 1000 // 1 hour
  }
});
