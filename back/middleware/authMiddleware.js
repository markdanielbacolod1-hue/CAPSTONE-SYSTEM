const jwt = require("jsonwebtoken");
const pool = require("../config/database");
async function authenticate(req,res,next) {
  try {
    const header=req.headers.authorization||"";
    const token=header.startsWith("Bearer ")?header.slice(7):null;
    if(!token) return res.status(401).json({message:"Authentication required."});
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const [rows]=await pool.execute(
      "SELECT UserID, Username, FullName, Email, Role FROM `user` WHERE UserID=?",
      [decoded.userId]
    );
    if(!rows.length) return res.status(401).json({message:"Account no longer exists."});
    req.user=rows[0]; next();
  } catch(e) { return res.status(401).json({message:"Invalid or expired session."}); }
}

async function optionalAuthenticate(req,res,next) {
  const header=req.headers.authorization||"";
  const token=header.startsWith("Bearer ")?header.slice(7):null;
  if(!token) return next();
  try {
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const [rows]=await pool.execute(
      "SELECT UserID, Username, FullName, Email, Role FROM `user` WHERE UserID=?",
      [decoded.userId]
    );
    if(rows.length) req.user=rows[0];
    next();
  } catch(e) { next(); }
}
module.exports={authenticate,optionalAuthenticate};

