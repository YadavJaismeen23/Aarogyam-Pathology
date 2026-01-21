const express = require("express");
const path = require("path");
const sessionConfig = require("./config/session");

const app = express();

/* -------------------------
   View Engine
-------------------------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* -------------------------
   Core Middlewares
-------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------------
   Session (MUST be before routes)
-------------------------- */
app.use(sessionConfig);

/* -------------------------
   Health Check (Render needs this)
-------------------------- */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* -------------------------
   Routes
-------------------------- */
const webRoutes = require("./routes/web.routes");
app.use("/", webRoutes);

/* -------------------------
   Server Start
-------------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
