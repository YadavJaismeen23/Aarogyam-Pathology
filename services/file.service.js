const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/patients.json");

const readData = () => {
  try {
    if (!fs.existsSync(dataPath)) {
      return [];
    }

    const raw = fs.readFileSync(dataPath, "utf8");

    if (!raw || raw.trim() === "") {
      return [];
    }

    return JSON.parse(raw);
  } catch (err) {
    console.error("❌ Error reading JSON file:", err.message);
    return [];
  }
};

const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

const addPatientReport = (report) => {
  const data = readData();
  data.push(report);
  writeData(data);
};

module.exports = {
  readData,
  writeData,
  addPatientReport
};
