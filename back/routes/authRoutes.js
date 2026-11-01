const r=require("express").Router(),c=require("../controllers/authController"),{authenticate}=require("../middleware/authMiddleware");
r.post("/register",c.register);r.post("/login",c.login);r.get("/me",authenticate,c.me);module.exports=r;
