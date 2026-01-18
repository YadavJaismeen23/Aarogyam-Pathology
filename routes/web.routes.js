const express = require("express");
const router = express.Router();

const upload = require("../services/upload.service");
const { addPatientReport, readData } = require("../services/file.service");
const { v4: uuidv4 } = require("uuid");
const { generateWhatsAppLink } = require("../services/whatsapp.service");
const auth = require("../middleware/auth.middleware");

// HOME
router.get("/", (req, res) => {
  res.render("pages/home", {
    title: "Aarogyam Lifecare"
  });
});

// TESTS
router.get("/tests", (req, res) => {
  res.render("pages/tests", {
    title: "Lab Tests | Aarogyam Lifecare"
  });
});

// REPORT STATUS (GET)
router.get("/report-status", (req, res) => {
  res.render("pages/report-status", {
    title: "Report Status | Aarogyam Lifecare",
    error: null,
    report: null
  });
});

// REPORT STATUS (POST)
router.post("/report-status", (req, res) => {
  const searchValue = req.body.searchValue;
  const data = readData();

  const report = data.find(
    r => r.reportId === searchValue || r.phone === searchValue
  );

  if (!report) {
    return res.render("pages/report-status", {
      title: "Report Status | Aarogyam Lifecare",
      error: "No report found. Please check your Report ID or Phone number.",
      report: null
    });
  }

  res.render("pages/report-status", {
    title: "Report Status | Aarogyam Lifecare",
    error: null,
    report
  });
});

// ADMIN UPLOAD (GET)
router.get("/admin/upload", auth, (req, res) => {
    res.render("admin/upload", {
      title: "Upload Report | Admin"
    });
  });
  
  // ADMIN UPLOAD (POST)
  router.post(
    "/admin/upload",
    auth,
    upload.single("reportPdf"),
    (req, res) => {
      const reportId = uuidv4().slice(0, 8);
  
      // 1️⃣ Create report object FIRST
      const reportData = {
        reportId,
        patientName: req.body.patientName,
        phone: req.body.phone,
        testName: req.body.testName,
        filePath: `/uploads/reports/${req.file.filename}`,
        uploadedAt: new Date()
      };
  
      // 2️⃣ Save to JSON
      addPatientReport(reportData);
  
      // 3️⃣ Generate WhatsApp link USING reportData
      const whatsappLink = generateWhatsAppLink({
        phone: reportData.phone,
        patientName: reportData.patientName,
        testName: reportData.testName,
        reportId: reportData.reportId
      });
  
      // 4️⃣ Respond
      res.send(`
        <h2>Report Uploaded Successfully ✅</h2>
  
        <p><strong>Report ID:</strong> ${reportId}</p>
  
        <a href="${whatsappLink}" target="_blank"
           style="display:inline-block;margin-top:15px;
           background:#25D366;color:white;
           padding:10px 18px;border-radius:4px;
           text-decoration:none;font-weight:600;">
           📲 Send Report via WhatsApp
        </a>
  
        <br/><br/>
        <a href="/admin/upload">Upload another</a>
      `);
    }
  );

  // ADMIN LOGIN (GET)
router.get("/admin/login", (req, res) => {
    res.render("admin/login", {
      title: "Admin Login",
      error: null
    });
  });
  
  // ADMIN LOGIN (POST)
  router.post("/admin/login", (req, res) => {
    const { username, password } = req.body;
  
    // TEMP admin credentials
    if (username === "admin" && password === "admin123") {
      req.session.isAdmin = true;
      return res.redirect("/admin/upload");
    }
  
    res.render("admin/login", {
      title: "Admin Login",
      error: "Invalid credentials"
    });
  });
  
  // ADMIN LOGOUT
  router.get("/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/admin/login");
    });
  });
  

module.exports = router;
