function allowRoles(...roles) {
  return (req,res,next) => roles.includes(req.user?.Role)
    ? next() : res.status(403).json({message:"You are not authorized to perform this action."});
}
module.exports={allowRoles};
