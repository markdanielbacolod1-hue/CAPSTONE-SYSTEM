function notFound(req,res){res.status(404).json({message:"API endpoint not found."});}
function errorHandler(err,req,res,next){
  console.error(err);
  if(err.code==="ER_DUP_ENTRY") return res.status(409).json({message:"A record with the same unique value already exists."});
  if(err.code==="ER_NO_REFERENCED_ROW_2"||err.code==="ER_ROW_IS_REFERENCED_2") return res.status(409).json({message:"This record is linked to other records and cannot be changed this way."});
  const status=err.status||400;
  res.status(status).json({message:err.message||"Unexpected server error."});
}
module.exports={notFound,errorHandler};
