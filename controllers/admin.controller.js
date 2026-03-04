const { read, write } = require('../services/data.service');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Aarogyam@2024';

exports.loginGet = (req, res) => {
  if (req.session.admin) return res.redirect('/admin/dashboard');
  res.render('admin/login');
};

exports.loginPost = (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = true;
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: 'Invalid credentials. Please try again.' });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
};

exports.dashboard = (req, res) => {
  const appointments = read('appointments.json');
  const reports = read('reports.json');
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    reports: reports.length
  };
  res.render('admin/dashboard', {
    stats,
    recentAppointments: appointments.slice(0, 20),
    flash: req.session.flash ? (() => { const f = req.session.flash; delete req.session.flash; return f; })() : null
  });
};

exports.appointmentsGet = (req, res) => {
  const all = read('appointments.json');
  const filter = req.query.status || 'all';
  const appointments = filter === 'all' ? all : all.filter(a => a.status === filter);
  const counts = {
    all: all.length,
    pending: all.filter(a => a.status === 'pending').length,
    confirmed: all.filter(a => a.status === 'confirmed').length,
    done: all.filter(a => a.status === 'done').length
  };
  res.render('admin/appointments', { appointments, filter, counts });
};

exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const appointments = read('appointments.json');
  const idx = appointments.findIndex(a => a.id === id);
  if (idx !== -1) {
    appointments[idx].status = status;
    write('appointments.json', appointments);
  }
  res.redirect(req.get('Referer') || '/admin/appointments');
};

exports.reportsGet = (req, res) => {
  const reports = read('reports.json');
  res.render('admin/reports', {
    reports,
    flash: req.session.flash ? (() => { const f = req.session.flash; delete req.session.flash; return f; })() : null
  });
};

exports.uploadReport = (req, res) => {
  if (!req.file) {
    req.session.flash = { type: 'error', msg: 'Please upload a PDF file.' };
    return res.redirect('/admin/reports');
  }
  const { patientName, mobile, testName, notes } = req.body;
  const reports = read('reports.json');
  reports.unshift({
    id: uuidv4(),
    patientName, mobile, testName, notes,
    filename: req.file.filename,
    uploadedAt: new Date().toISOString()
  });
  write('reports.json', reports);
  req.session.flash = { type: 'success', msg: `Report uploaded for ${patientName}` };
  res.redirect('/admin/reports');
};

exports.deleteReport = (req, res) => {
  const { id } = req.params;
  const reports = read('reports.json');
  const report = reports.find(r => r.id === id);
  if (report) {
    const filePath = path.join(__dirname, '../uploads/reports', report.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    write('reports.json', reports.filter(r => r.id !== id));
  }
  req.session.flash = { type: 'success', msg: 'Report deleted.' };
  res.redirect('/admin/reports');
};

exports.testsGet = (req, res) => {
  const tests = read('tests.json');
  res.render('admin/tests', {
    tests,
    flash: req.session.flash ? (() => { const f = req.session.flash; delete req.session.flash; return f; })() : null
  });
};

exports.addTest = (req, res) => {
  const { name, nameHi, category, description, price, reportTime, popular } = req.body;
  const tests = read('tests.json');
  tests.push({
    id: uuidv4(),
    name, nameHi: nameHi || name,
    category, categoryHi: category,
    description: description || '',
    descriptionHi: description || '',
    price: parseInt(price) || 0,
    reportTime: reportTime || '4 hours',
    reportTimeHi: reportTime || '4 घंटे',
    popular: !!popular
  });
  write('tests.json', tests);
  req.session.flash = { type: 'success', msg: `Test "${name}" added.` };
  res.redirect('/admin/tests');
};

exports.deleteTest = (req, res) => {
  const { id } = req.params;
  const tests = read('tests.json');
  write('tests.json', tests.filter(t => t.id !== id));
  req.session.flash = { type: 'success', msg: 'Test deleted.' };
  res.redirect('/admin/tests');
};
