const mongoose=require('mongoose')

const commentSchema=new mongoose.Schema({
    articleId:{
        type:String,
        required:true
    },
    comments:{
        type:[{email:String,comment:String,createdAt:{type:Date,default:Date.now}}],
        required:true
    }

})
module.exports=mongoose.model('Comment',commentSchema)