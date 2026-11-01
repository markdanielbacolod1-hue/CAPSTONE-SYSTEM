const r = require("express").Router();
const c = require("../controllers/activityController");
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
r.get("/", authenticate, allowRoles("Admin"), c.list);
module.exports = r;
