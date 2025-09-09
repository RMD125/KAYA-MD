const fs = require('fs');
const path = './banned.json';

function loadBanned() {
  try {
    const data = fs.readFileSync(path);
    return JSON.parse(data).banned || [];
  } catch (e) {
    return [];
  }
}

function saveBanned(list) {
  fs.writeFileSync(path, JSON.stringify({ banned: list }, null, 2));
}

function isBanned(userId) {
  const banned = loadBanned();
  return banned.includes(userId);
}

function banUser(userId) {
  const banned = loadBanned();
  if (!banned.includes(userId)) {
    banned.push(userId);
    saveBanned(banned);
    return true;
  }
  return false;
}

function unbanUser(userId) {
  let banned = loadBanned();
  if (banned.includes(userId)) {
    banned = banned.filter(id => id !== userId);
    saveBanned(banned);
    return true;
  }
  return false;
}

module.exports = {
  isBanned,
  banUser,
  unbanUser
};