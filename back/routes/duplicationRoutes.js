const r=require("express").Router(),c=require("../controllers/duplicationController"),{authenticate}=require("../middleware/authMiddleware"),{allowRoles}=require("../middleware/roleMiddleware");
r.get("/",authenticate,allowRoles("Admin","Faculty"),c.list);module.exports=r;
