
const mongoose=require("mongoose");
const userschema= new mongoose.Schema({
 name:{
 type:String,
 required:true
},
email:{
  type:String,
  required:true
},

password:{
   type:String,
  required:true
},
is_admin:{
  type:Number,
  required:true
},
isBlocked:{
  type:Boolean,
  default:false
}
});
module.exports=mongoose.model('user',userschema);