const pool=require("../config/database"), bcrypt=require("bcryptjs"), jwt=require("jsonwebtoken");
const asyncHandler=require("../utils/asyncHandler");
exports.register=asyncHandler(async(req,res)=>{
  const {username,password,fullName,email,role="Student",studentNumber,course,yearLevel}=req.body;
  if(!username||!password||!fullName||!email) return res.status(400).json({message:"Username, password, full name, and email are required."});
  if(String(password).length<8) return res.status(400).json({message:"Password must contain at least 8 characters."});
  if(!["Student","CommunityMember"].includes(role)) return res.status(403).json({message:"This role cannot be self-registered."});
  if(role==="Student"&&(!studentNumber||!course||!yearLevel)) return res.status(400).json({message:"Student number, course, and year level are required for student registration."});
  const conn=await pool.getConnection();
  try{
    await conn.beginTransaction();
    const hash=await bcrypt.hash(password,12);
    const [result]=await conn.execute("INSERT INTO `user` (Username,Password,FullName,Email,Role) VALUES (?,?,?,?,?)",[username,hash,fullName,email,role]);
    if(role==="Student") await conn.execute("INSERT INTO student (UserID,StudentNumber,Course,YearLevel) VALUES (?,?,?,?)",[result.insertId,studentNumber,course,yearLevel]);
    await conn.commit();
    res.status(201).json({message:"Account created. You can now log in."});
  }catch(e){await conn.rollback();throw e;}finally{conn.release();}
});
exports.login=asyncHandler(async(req,res)=>{
  const {identifier,password}=req.body;
  if(!identifier||!password) return res.status(400).json({message:"Username/email and password are required."});
  const [rows]=await pool.execute("SELECT UserID,Username,Password,FullName,Email,Role FROM `user` WHERE Username=? OR Email=? LIMIT 1",[identifier,identifier]);
  if(!rows.length||!(await bcrypt.compare(password,rows[0].Password))) return res.status(401).json({message:"Invalid credentials."});
  const u=rows[0], token=jwt.sign({userId:u.UserID},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||"8h"});
  delete u.Password;
  res.json({token,user:u});
});
exports.me=asyncHandler(async(req,res)=>{
 const [s]=await pool.execute("SELECT StudentID,StudentNumber,Course,YearLevel FROM student WHERE UserID=?",[req.user.UserID]);
 res.json({user:req.user,student:s[0]||null});
});
