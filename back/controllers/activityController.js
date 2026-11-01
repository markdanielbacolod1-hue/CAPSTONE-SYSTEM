const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
exports.list = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT a.log_id AS id, a.user_id AS userId, u.FullName AS fullName,
      a.action, a.entity_type AS entityType, a.entity_id AS entityId,
      a.description, a.created_at AS createdAt
    FROM activity_log a LEFT JOIN \`user\` u ON u.UserID = a.user_id
    ORDER BY a.created_at DESC, a.log_id DESC LIMIT 500
  `);
  res.json(rows);
});
