const router = require("express").Router();
const categoryController = require("../controllers/categoryController");
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get("/", categoryController.list);
router.post("/", authenticate, allowRoles("Admin"), categoryController.create);
router.put("/:id", authenticate, allowRoles("Admin"), categoryController.update);
router.delete("/:id", authenticate, allowRoles("Admin"), categoryController.remove);

module.exports = router;