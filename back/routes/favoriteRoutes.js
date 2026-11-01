const r=require("express").Router(),c=require("../controllers/favoriteController"),{authenticate}=require("../middleware/authMiddleware");
r.use(authenticate);r.get("/",c.list);r.post("/:recipeId",c.add);r.delete("/:recipeId",c.remove);module.exports=r;
