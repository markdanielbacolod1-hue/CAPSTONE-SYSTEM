require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");

const pool = require("./config/database");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "uploads")));

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  require("./routes/authRoutes")
);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/ingredients", require("./routes/ingredientRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/duplication-logs", require("./routes/duplicationRoutes"));
app.use("/api/activity-logs", require("./routes/activityRoutes"));

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (e) {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Culinary Archive API listening on port ${port}`));