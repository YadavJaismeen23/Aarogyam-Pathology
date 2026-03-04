const { read, write } = require('../services/data.service');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

exports.home = (req, res) => {
  res.render('index');
};

exports.tests = (req, res) => {
  const tests = read('tests.json');
  res.render('tests', { tests });
};

exports.about = (req, res) => {
  res.render('about');
};

exports.contact = (req, res) => {
  res.render('contact');
};

exports.appointmentGet = (req, res) => {
  res.render('appointment');
};

exports.appointmentPost = (req, res) => {
  const { name, ageSex, phone, address, date, time, serviceType, tests, referredBy } = req.body;
  if (!name || !phone || !date || !time || !serviceType) {
    return res.render('appointment', { error: 'Please fill all required fields.' });
  }
  const appointments = read('appointments.json');
  const appt = {
    id: uuidv4(),
    name, ageSex, phone, address, date, time, serviceType,
    tests, referredBy,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  appointments.unshift(appt);
  write('appointments.json', appointments);
  res.render('appointment', { success: appt });
};

exports.reportsGet = (req, res) => {
  res.render('reports');
};

exports.reportsSearch = (req, res) => {
  const { query } = req.body;
  if (!query) return res.render('reports', { error: 'Please enter a mobile number or patient ID.' });
  const reports = read('reports.json');
  const found = reports.filter(r =>
    r.mobile === query.trim() ||
    r.id === query.trim() ||
    r.patientName.toLowerCase().includes(query.toLowerCase())
  );
  res.render('reports', { reports: found, query });
};

exports.reportDownload = (req, res) => {
  const { id } = req.params;
  const reports = read('reports.json');
  const report = reports.find(r => r.id === id);
  if (!report) return res.status(404).send('Report not found');
  const filePath = path.join(__dirname, '../uploads/reports', report.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.download(filePath, `${report.patientName}-${report.testName}.pdf`);
};
