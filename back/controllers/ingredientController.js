const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const audit = require("../utils/audit");

exports.list = asyncHandler(async (req, res) => {
  const [r] = await pool.execute(
    "SELECT i.IngredientID AS id, i.IngredientName AS name, i.ingredient_category_id AS categoryId, c.category_name AS categoryName FROM ingredient i LEFT JOIN ingredient_categories c ON c.ingredient_category_id = i.ingredient_category_id ORDER BY i.IngredientName"
  );
  res.json(r);
});

exports.create = asyncHandler(async (req, res) => {
  const { name, categoryId } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Ingredient name is required." });
  }

  const [r] = await pool.execute(
    "INSERT INTO ingredient (IngredientName, ingredient_category_id) VALUES (?, ?)",
    [name.trim(), categoryId || null]
  );

  await audit(
    req.user.UserID,
    "CREATE",
    "Ingredient",
    r.insertId,
    `Created ingredient: ${name.trim()}`
  );

  res.status(201).json({ id: r.insertId });
});

exports.update = asyncHandler(async (req, res) => {
  const { name, categoryId } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Ingredient name is required." });
  }

  const [r] = await pool.execute(
    "UPDATE ingredient SET IngredientName = ?, ingredient_category_id = ? WHERE IngredientID = ?",
    [name.trim(), categoryId || null, req.params.id]
  );

  if (!r.affectedRows) {
    return res.status(404).json({ message: "Ingredient not found." });
  }

  await audit(
    req.user.UserID,
    "UPDATE",
    "Ingredient",
    req.params.id,
    `Updated ingredient: ${name.trim()}`
  );

  res.json({ message: "Ingredient updated." });
});

exports.remove = asyncHandler(async (req, res) => {
  const [r] = await pool.execute("DELETE FROM ingredient WHERE IngredientID = ?", [req.params.id]);

  if (!r.affectedRows) {
    return res.status(404).json({ message: "Ingredient not found." });
  }

  await audit(
    req.user.UserID,
    "DELETE",
    "Ingredient",
    req.params.id,
    "Deleted ingredient."
  );

  res.json({ message: "Ingredient deleted." });
});

exports.listCategories = asyncHandler(async (req, res) => {
  const [r] = await pool.execute(
    "SELECT ingredient_category_id AS id, category_name AS name, description FROM ingredient_categories ORDER BY category_name"
  );
  res.json(r);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const [r] = await pool.execute(
    "INSERT INTO ingredient_categories (category_name, description) VALUES (?, ?)",
    [name.trim(), description || null]
  );

  await audit(
    req.user.UserID,
    "CREATE",
    "Ingredient category",
    r.insertId,
    `Created ingredient category: ${name.trim()}`
  );

  res.status(201).json({ id: r.insertId });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const [r] = await pool.execute(
    "UPDATE ingredient_categories SET category_name = ?, description = ? WHERE ingredient_category_id = ?",
    [name.trim(), description || null, req.params.id]
  );

  if (!r.affectedRows) {
    return res.status(404).json({ message: "Ingredient category not found." });
  }

  await audit(
    req.user.UserID,
    "UPDATE",
    "Ingredient category",
    req.params.id,
    `Updated ingredient category: ${name.trim()}`
  );

  res.json({ message: "Ingredient category updated." });
});

exports.removeCategory = asyncHandler(async (req, res) => {
  const [r] = await pool.execute(
    "DELETE FROM ingredient_categories WHERE ingredient_category_id = ?",
    [req.params.id]
  );

  if (!r.affectedRows) {
    return res.status(404).json({ message: "Ingredient category not found." });
  }

  await audit(
    req.user.UserID,
    "DELETE",
    "Ingredient category",
    req.params.id,
    "Deleted ingredient category."
  );

  res.json({ message: "Ingredient category deleted." });
});