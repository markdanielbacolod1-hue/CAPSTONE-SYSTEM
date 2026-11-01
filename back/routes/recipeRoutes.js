const r=require("express").Router(),c=require("../controllers/recipeController"),{authenticate,optionalAuthenticate}=require("../middleware/authMiddleware"),{allowRoles}=require("../middleware/roleMiddleware"),{recipeFiles}=require("../middleware/uploadMiddleware");
r.get("/",optionalAuthenticate,c.list);r.get("/:id",optionalAuthenticate,c.get);
r.post("/",authenticate,allowRoles("Student"),recipeFiles,c.create);
r.put("/:id",authenticate,allowRoles("Student","Faculty","Admin"),recipeFiles,c.update);
r.patch("/:id/review",authenticate,allowRoles("Admin","Faculty"),c.review);
r.patch("/:id/active",authenticate,allowRoles("Admin","Faculty"),c.setActive);
r.delete("/:id",authenticate,allowRoles("Admin"),c.remove);
module.exports=r;
