const r=require("express").Router(),c=require("../controllers/userController"),{authenticate}=require("../middleware/authMiddleware"),{allowRoles}=require("../middleware/roleMiddleware");
r.use(authenticate,allowRoles("Admin"));r.get("/",c.list);r.get("/:id",c.get);r.put("/:id",c.update);r.delete("/:id",c.deactivate);module.exports=r;
