const pool=require("../config/database"), asyncHandler=require("../utils/asyncHandler");
const path=require("path");
const fields=`r.RecipeID AS id,r.Title AS title,r.Description AS description,r.CategoryID AS categoryId,
 c.CategoryName AS categoryName,r.SubmittedBy AS submittedBy,u.FullName AS student,
 r.DishPhoto AS dishPhoto,r.PDFFile AS pdfFile,r.DateSubmitted AS submittedAt,r.Status AS status,
 r.ReviewedBy AS reviewedBy,rv.FullName AS reviewer,r.DateReviewed AS reviewedAt,r.Remarks AS reviewRemarks,
 r.prep_time_minutes AS prepTime,r.cook_time_minutes AS cookTime,r.total_duration_minutes AS totalDuration,
 r.is_copy AS isCopy,r.original_recipe_id AS originalRecipeId,r.duplication_rule AS duplicationRule,
 r.is_active AS active,r.is_edited AS edited,r.last_edited_by AS lastEditedBy,r.last_edited_at AS lastEditedAt`;
async function details(id,executor=pool){
 const [rows]=await executor.execute(`SELECT ${fields} FROM recipe r JOIN category c ON c.CategoryID=r.CategoryID JOIN \`user\` u ON u.UserID=r.SubmittedBy LEFT JOIN \`user\` rv ON rv.UserID=r.ReviewedBy WHERE r.RecipeID=?`,[id]);
 if(!rows.length)return null;
 const [ings]=await executor.execute(`SELECT ri.RecipeIngredientID AS id,i.IngredientID AS ingredientId,i.IngredientName AS name,ri.Quantity AS quantity,ri.Unit AS unit,ic.category_name AS categoryName FROM recipe_ingredient ri JOIN ingredient i ON i.IngredientID=ri.IngredientID LEFT JOIN ingredient_categories ic ON ic.ingredient_category_id=i.ingredient_category_id WHERE ri.RecipeID=? ORDER BY i.IngredientName`,[id]);
 const [steps]=await executor.execute("SELECT StepID AS id,StepNumber AS stepNumber,Instruction AS instruction FROM recipe_step WHERE RecipeID=? ORDER BY StepNumber",[id]);
 return {...rows[0],ingredients:ings,steps};
}
exports.list=asyncHandler(async(req,res)=>{
 const {search="",categoryId,status}=req.query;
 const clauses=[],args=[];
 if(!req.user){clauses.push("r.Status='Approved'","r.is_active=1");}
 else if(req.user.Role==="Student"){clauses.push("(r.Status='Approved' AND r.is_active=1 OR r.SubmittedBy=?)");args.push(req.user.UserID);if(status) {clauses.push("r.Status=?");args.push(status);}}
 else if(req.user.Role==="CommunityMember"){clauses.push("r.Status='Approved'","r.is_active=1");}
 else {if(status){clauses.push("r.Status=?");args.push(status);}}
 if(categoryId){clauses.push("r.CategoryID=?");args.push(categoryId);}
 if(search.trim()){clauses.push("(r.Title LIKE ? OR r.Description LIKE ? OR u.FullName LIKE ?)");args.push(`%${search.trim()}%`,`%${search.trim()}%`,`%${search.trim()}%`);}
 const where=clauses.length?`WHERE ${clauses.join(" AND ")}`:"";
 const [rows]=await pool.execute(`SELECT ${fields} FROM recipe r JOIN category c ON c.CategoryID=r.CategoryID JOIN \`user\` u ON u.UserID=r.SubmittedBy LEFT JOIN \`user\` rv ON rv.UserID=r.ReviewedBy ${where} ORDER BY r.DateSubmitted DESC`,args);
 res.json(rows);
});
exports.get=asyncHandler(async(req,res)=>{
 const recipe=await details(req.params.id);
 if(!recipe)return res.status(404).json({message:"Recipe not found."});
 const isOwner=req.user&&recipe.submittedBy===req.user.UserID;
 const canSeePrivate=req.user&&( ["Admin","Faculty"].includes(req.user.Role)||isOwner );
 if(!(recipe.status==="Approved"&&recipe.active)&&!canSeePrivate)return res.status(404).json({message:"Recipe not found."});
 res.json(recipe);
});
exports.create=asyncHandler(async(req,res)=>{
 const {title,description,categoryId,prepTime=0,cookTime=0,ingredients="[]",steps="[]",originalRecipeId}=req.body;
 if(!title?.trim()||!categoryId||!req.files?.dishPhoto?.[0]||!req.files?.pdfFile?.[0])return res.status(400).json({message:"Title, category, dish image, and PDF are required."});
 let ing,st;try{ing=JSON.parse(ingredients);st=JSON.parse(steps);}catch{return res.status(400).json({message:"Ingredients and steps must be valid JSON arrays."});}
 if(!Array.isArray(ing)||!Array.isArray(st))return res.status(400).json({message:"Ingredients and steps must be arrays."});
 const conn=await pool.getConnection();
 try{
  await conn.beginTransaction();
  const photo=path.posix.join("images",req.files.dishPhoto[0].filename),pdf=path.posix.join("pdfs",req.files.pdfFile[0].filename);
  const [r]=await conn.execute(`INSERT INTO recipe(Title,Description,CategoryID,SubmittedBy,DishPhoto,PDFFile,Status,prep_time_minutes,cook_time_minutes,is_copy,original_recipe_id) VALUES(?,?,?,?,?,?,'Pending',?,?,?,?)`,
  [title.trim(),description||null,categoryId,req.user.UserID,photo,pdf,Number(prepTime)||0,Number(cookTime)||0,originalRecipeId?1:0,originalRecipeId||null]);
  const recipeId=r.insertId;
  for(const item of ing){
   if(!item.name?.trim())continue;
   let [found]=await conn.execute("SELECT IngredientID FROM ingredient WHERE IngredientName=?",[item.name.trim()]);
   let ingredientId;
   if(found.length)ingredientId=found[0].IngredientID;
   else {const [created]=await conn.execute("INSERT INTO ingredient(IngredientName,ingredient_category_id) VALUES(?,?)",[item.name.trim(),item.categoryId||null]);ingredientId=created.insertId;}
   await conn.execute("INSERT INTO recipe_ingredient(RecipeID,IngredientID,Quantity,Unit) VALUES(?,?,?,?)",[recipeId,ingredientId,Number(item.quantity)||0,String(item.unit||"").slice(0,20)]);
  }
  for(let i=0;i<st.length;i++){if(st[i].instruction?.trim())await conn.execute("INSERT INTO recipe_step(RecipeID,StepNumber,Instruction) VALUES(?,?,?)",[recipeId,i+1,st[i].instruction.trim()]);}
  if(originalRecipeId) await conn.execute("INSERT INTO recipe_duplication_log(source_recipe_id,new_recipe_id,copied_by,override_reason) VALUES(?,?,?,?)",[originalRecipeId,recipeId,req.user.UserID,"Submitted as a revision."]);
  await conn.commit();
  res.status(201).json({message:"Recipe submitted for faculty review.",recipe:await details(recipeId)});
 }catch(e){await conn.rollback();throw e;}finally{conn.release();}
});
exports.update=asyncHandler(async(req,res)=>{
 const id=req.params.id;const [old]=await pool.execute("SELECT SubmittedBy,Status FROM recipe WHERE RecipeID=?",[id]);
 if(!old.length)return res.status(404).json({message:"Recipe not found."});
 if(req.user.Role==="Student"&&(old[0].SubmittedBy!==req.user.UserID||old[0].Status==="Pending"))return res.status(403).json({message:"You can only edit your own reviewed submissions."});
 const {title,description,categoryId,prepTime,cookTime}=req.body;
 const sets=[],args=[];
 for(const [k,v] of [["Title",title],["Description",description],["CategoryID",categoryId],["prep_time_minutes",prepTime],["cook_time_minutes",cookTime]])if(v!==undefined){sets.push(`\`${k}\`=?`);args.push(v);}
 if(req.files?.dishPhoto?.[0]){sets.push("DishPhoto=?");args.push(path.posix.join("images",req.files.dishPhoto[0].filename));}
 if(req.files?.pdfFile?.[0]){sets.push("PDFFile=?");args.push(path.posix.join("pdfs",req.files.pdfFile[0].filename));}
 if(!sets.length)return res.status(400).json({message:"No changes supplied."});
 sets.push("is_edited=1","last_edited_by=?","last_edited_at=NOW()");args.push(req.user.UserID,id);
 await pool.execute(`UPDATE recipe SET ${sets.join(",")} WHERE RecipeID=?`,args);
 res.json({message:"Recipe updated.",recipe:await details(id)});
});
exports.review=asyncHandler(async(req,res)=>{
 const {status,remarks}=req.body;
 if(!["Pending","Approved","Rejected"].includes(status))return res.status(400).json({message:"Invalid recipe status."});
 const [r]=await pool.execute("UPDATE recipe SET Status=?,ReviewedBy=?,DateReviewed=NOW(),Remarks=? WHERE RecipeID=?",[status,req.user.UserID,remarks||null,req.params.id]);
 if(!r.affectedRows)return res.status(404).json({message:"Recipe not found."});
 res.json({message:`Recipe ${status.toLowerCase()}.`});
});
exports.setActive=asyncHandler(async(req,res)=>{
 const [r]=await pool.execute("UPDATE recipe SET is_active=? WHERE RecipeID=?",[req.body.active?1:0,req.params.id]);
 if(!r.affectedRows)return res.status(404).json({message:"Recipe not found."});
 res.json({message:"Recipe visibility updated."});
});
exports.remove=asyncHandler(async(req,res)=>{
 const [r]=await pool.execute("DELETE FROM recipe WHERE RecipeID=?",[req.params.id]);
 if(!r.affectedRows)return res.status(404).json({message:"Recipe not found."});
 res.json({message:"Recipe deleted."});
});
