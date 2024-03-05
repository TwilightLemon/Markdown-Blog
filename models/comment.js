const mongoose=require('mongoose')

const commentSchema=new mongoose.Schema({
    articleId:{
        type:String,
        required:true
    },
    likes:{
        type:[String],
        required:false
    },
    comments:{
        type:[{email:String,comment:String,createdAt:{type:Date,default:Date.now}}],
        required:true
    }

})
module.exports=mongoose.model('Comment',commentSchema)