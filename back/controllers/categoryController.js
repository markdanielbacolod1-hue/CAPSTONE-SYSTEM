const pool = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const audit = require("../utils/audit");

exports.list = asyncHandler(async (req, res) => {
  const [r] = await pool.execute(
    "SELECT CategoryID AS id, CategoryName AS name, Description AS description FROM category ORDER BY CategoryName"
  );
  res.json(r);
});

exports.create = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const [r] = await pool.execute(
    "INSERT INTO category (CategoryName, Description) VALUES (?, ?)",
    [name.trim(), description || null]
  );

  await audit(
    req.user.UserID,
    "CREATE",
    "Recipe category",
    r.insertId,
    `Created category: ${name.trim()}`
  );

  res.status(201).json({
    id: r.insertId,
    name: name.trim(),
    description: description || null,
  });
});

exports.update = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const [r] = await pool.execute(
    "UPDATE category SET CategoryName = ?, Description = ? WHERE CategoryID = ?",
    [name.trim(), description || null, req.params.id]
  );

  if (!r.affectedRows) {
    return res.status(404).json({ message: "Category not found." });
  }

  await audit(
    req.user.UserID,
    "UPDATE",
    "Recipe category",
    req.params.id,
    `Updated category: ${name.trim()}`
  );

  res.json({ message: "Category updated." });
});

exports.remove = asyncHandler(async (req, res) => {
  const [r] = await pool.execute("DELETE FROM category WHERE CategoryID = ?", [req.params.id]);

  if (!r.affectedRows) {
    return res.status(404).json({ message: "Category not found." });
  }

  await audit(
    req.user.UserID,
    "DELETE",
    "Recipe category",
    req.params.id,
    "Deleted recipe category."
  );

  res.json({ message: "Category deleted." });
});