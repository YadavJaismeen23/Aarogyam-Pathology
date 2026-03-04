require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const sessionConfig = require("./config/session");

const app = express();

/* ===============================
   Render Proxy Trust
================================ */
app.set("trust proxy", 1);

/* ===============================
   View Engine
================================ */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ===============================
   Core Middlewares
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   CORS Configuration
================================ */
app.use(
  cors({
    origin: [
      "https://aarogyamlifecare.com",
      "https://www.aarogyamlifecare.com",
      "http://localhost:3000"
    ],
    credentials: true
  })
);

/* ===============================
   Static Assets
================================ */
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===============================
   Session (before routes)
================================ */
app.use(sessionConfig);

/* ===============================
   Health Check (Render)
================================ */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* ===============================
   Routes
================================ */
const webRoutes = require("./routes/web.routes");
app.use("/", webRoutes);

/* ===============================
   Server Start
================================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
