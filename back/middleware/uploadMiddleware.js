const multer=require("multer"), path=require("path"), fs=require("fs");
const root=path.resolve(process.env.UPLOAD_DIR||"uploads");
fs.mkdirSync(path.join(root,"images"),{recursive:true});
fs.mkdirSync(path.join(root,"pdfs"),{recursive:true});
const storage=multer.diskStorage({
  destination:(req,file,cb)=>cb(null,path.join(root,file.fieldname==="dishPhoto"?"images":"pdfs")),
  filename:(req,file,cb)=>cb(null,`${Date.now()}-${require("crypto").randomBytes(8).toString("hex")}${path.extname(file.originalname).toLowerCase()}`)
});
function fileFilter(req,file,cb){
  const ok=file.fieldname==="dishPhoto"
    ? ["image/jpeg","image/png","image/webp"].includes(file.mimetype)
    : file.fieldname==="pdfFile" && file.mimetype==="application/pdf";
  cb(ok?null:new Error("Only JPG, PNG, WEBP images and PDF documents are allowed."),ok);
}
const upload=multer({storage,fileFilter,limits:{fileSize:10*1024*1024}});
module.exports={recipeFiles:upload.fields([{name:"dishPhoto",maxCount:1},{name:"pdfFile",maxCount:1}])};
