const express = require('express');
const router = express.Router();
const web = require('../controllers/web.controller');
const admin = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Multer for report uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/reports')),
  filename: (req, file, cb) => cb(null, uuidv4() + '.pdf')
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  cb(null, file.mimetype === 'application/pdf');
}});

// ── Public Routes ──
router.get('/', web.home);
router.get('/tests', web.tests);
router.get('/about', web.about);
router.get('/contact', web.contact);
router.get('/appointment', web.appointmentGet);
router.post('/appointment', web.appointmentPost);
router.get('/reports', web.reportsGet);
router.post('/reports/search', web.reportsSearch);
router.get('/reports/download/:id', web.reportDownload);

// ── Admin Routes ──
router.get('/admin', (req, res) => res.redirect('/admin/login'));
router.get('/admin/login', admin.loginGet);
router.post('/admin/login', admin.loginPost);
router.get('/admin/logout', admin.logout);

// Protected
router.get('/admin/dashboard', auth, admin.dashboard);
router.get('/admin/appointments', auth, admin.appointmentsGet);
router.post('/admin/appointments/:id/status', auth, admin.updateStatus);
router.get('/admin/reports', auth, admin.reportsGet);
router.post('/admin/reports/upload', auth, upload.single('report'), admin.uploadReport);
router.post('/admin/reports/:id/delete', auth, admin.deleteReport);
router.get('/admin/tests', auth, admin.testsGet);
router.post('/admin/tests/add', auth, admin.addTest);
router.post('/admin/tests/:id/delete', auth, admin.deleteTest);

module.exports = router;
