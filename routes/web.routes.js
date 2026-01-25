const express = require("express");
const router = express.Router();

const upload = require("../services/upload.service");
const { addPatientReport, readData } = require("../services/file.service");
const { generateWhatsAppLink } = require("../services/whatsapp.service");
const { sendBookingEmail } = require("../services/email.service");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth.middleware");

/* =====================================================
   PUBLIC PAGES
===================================================== */

router.get("/", (req, res) => {
  res.render("pages/home", { title: "Aarogyam Lifecare" });
});

router.get("/about", (req, res) => {
  res.render("pages/about", { title: "About Us | Aarogyam Lifecare" });
});

router.get("/contact", (req, res) => {
  res.render("pages/contact", { title: "Contact Us | Aarogyam Lifecare" });
});

router.get("/tests", (req, res) => {
  res.render("pages/tests", { title: "Lab Tests | Aarogyam Lifecare" });
});

router.get("/book-test", (req, res) => {
  res.render("pages/book-test", {
    title: "Book Diagnostic Test | Aarogyam Lifecare",
    test: req.query.test || ""
  });
});

/* =====================================================
   REPORT STATUS
===================================================== */

router.get("/report-status", (req, res) => {
  res.render("pages/report-status", {
    title: "Report Status | Aarogyam Lifecare",
    error: null,
    report: null
  });
});

router.post("/report-status", (req, res) => {
  const { searchValue } = req.body;
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

/* =====================================================
   EMAIL API (BOOK TEST)
===================================================== */

router.post("/send-booking-email", async (req, res) => {
  try {
    const { lang, formData } = req.body;

    if (!formData || !formData.name || !formData.phone) {
      return res.status(400).json({ success: false });
    }

    const labels = {
      en: { subject: "New Test Booking Request", title: "Referral & Test Request" },
      hi: { subject: "नई जांच बुकिंग अनुरोध", title: "रेफरल एवं जांच अनुरोध" }
    };

    const L = labels[lang] || labels.en;

    const html = `
      <h2>${L.title}</h2>
      <p><b>Name:</b> ${formData.name}</p>
      <p><b>Age/Sex:</b> ${formData.ageSex || "-"}</p>
      <p><b>Phone:</b> ${formData.phone}</p>
      <p><b>Address:</b> ${formData.address || "-"}</p>
      <p><b>Referred By:</b> ${formData.referredBy || "Self"}</p>

      <h3>Complaints</h3>
      <ul>${(formData.complaints || []).map(c => `<li>${c}</li>`).join("")}</ul>

      <h3>Tests Requested</h3>
      <ul>${(formData.tests || []).map(t => `<li>${t}</li>`).join("")}</ul>

      <p><b>Delivery:</b> ${formData.delivery || "-"}</p>
    `;

    await sendBookingEmail({
      subject: L.subject,
      html
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   ADMIN
===================================================== */

router.get("/admin/login", (req, res) => {
  res.render("pages/admin/login", { title: "Admin Login", error: null });
});

router.post("/admin/login", (req, res) => {
  if (req.body.username === "admin" && req.body.password === "admin123") {
    req.session.isAdmin = true;
    return res.redirect("/admin/upload");
  }

  res.render("pages/admin/login", {
    title: "Admin Login",
    error: "Invalid credentials"
  });
});

router.get("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

router.get("/admin/upload", auth, (req, res) => {
  res.render("pages/admin/upload", { title: "Upload Report | Admin" });
});

router.post("/admin/upload", auth, upload.single("reportPdf"), (req, res) => {
  const reportId = uuidv4().slice(0, 8);

  const reportData = {
    reportId,
    patientName: req.body.patientName,
    phone: req.body.phone,
    testName: req.body.testName,
    filePath: `/uploads/reports/${req.file.filename}`,
    uploadedAt: new Date()
  };

  addPatientReport(reportData);

  const whatsappLink = generateWhatsAppLink(reportData);

  res.send(`
    <h2>Report Uploaded Successfully ✅</h2>
    <p><strong>Report ID:</strong> ${reportId}</p>
    <a href="${whatsappLink}" target="_blank"
      style="background:#25D366;color:#fff;padding:10px 18px;
      border-radius:4px;text-decoration:none;font-weight:600;">
      📲 Send Report via WhatsApp
    </a>
  `);
});

module.exports = router;
