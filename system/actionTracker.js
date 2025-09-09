// system/actionTracker.js
const recentActions = new Set();

function markAction(groupId, userId, type) {
  recentActions.add(`${groupId}:${userId}:${type}`);
  setTimeout(() => recentActions.delete(`${groupId}:${userId}:${type}`), 3000); // expire après 3 sec
}

function wasRecentlyActed(groupId, userId, type) {
  return recentActions.has(`${groupId}:${userId}:${type}`);
}

module.exports = {
  markAction,
  wasRecentlyActed
};