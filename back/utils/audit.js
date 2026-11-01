const pool = require("../config/database");

// Audit logging must never cause the main operation to fail.
async function recordActivity(userId, action, entityType, entityId = null, description = null) {
  try {
    await pool.execute(
      "INSERT INTO activity_log(user_id, action, entity_type, entity_id, description) VALUES(?,?,?,?,?)",
      [userId || null, String(action).slice(0, 80), String(entityType).slice(0, 60), entityId || null, description ? String(description).slice(0, 500) : null],
    );
  } catch (error) {
    // The migration may not have been applied yet; don't break the primary request.
    console.error("Activity log write failed:", error.message);
  }
}
module.exports = recordActivity;
