const generateWhatsAppLink = ({ phone, patientName, testName, reportId }) => {
    const baseUrl = "https://wa.me/91" + phone;
  
    const message = `
  Hello ${patientName},
  
  Your lab report for *${testName}* is ready ✅
  
  🧾 Report ID: ${reportId}
  
  You can download your report here:
  http://localhost:3000/report-status
  
  (Enter your Report ID to download)
  
  – Aarogyam Lifecare Diagnostic Centre
    `;
  
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  };
  
  module.exports = { generateWhatsAppLink };
  