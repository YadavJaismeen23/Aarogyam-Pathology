const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

function read(file) {
  try {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function write(file, data) {
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2));
}

module.exports = { read, write };
