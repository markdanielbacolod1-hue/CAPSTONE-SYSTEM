const router = require("express").Router();
const ingredientController = require("../controllers/ingredientController");
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get("/", ingredientController.list);
router.post("/", authenticate, allowRoles("Admin"), ingredientController.create);
router.put("/:id", authenticate, allowRoles("Admin"), ingredientController.update);
router.delete("/:id", authenticate, allowRoles("Admin"), ingredientController.remove);

router.get("/categories/list", ingredientController.listCategories);
router.post("/categories", authenticate, allowRoles("Admin"), ingredientController.createCategory);
router.put("/categories/:id", authenticate, allowRoles("Admin"), ingredientController.updateCategory);
router.delete("/categories/:id", authenticate, allowRoles("Admin"), ingredientController.removeCategory);

module.exports = router;