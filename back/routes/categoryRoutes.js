const r=require("express").Router(),c=require("../controllers/categoryController"),{authenticate}=require("../middleware/authMiddleware"),{allowRoles}=require("../middleware/roleMiddleware");
r.get("/",c.list);r.post("/",authenticate,allowRoles("Admin"),c.create);r.put("/:id",authenticate,allowRoles("Admin"),c.update);r.delete("/:id",authenticate,allowRoles("Admin"),c.remove);module.exports=r;
