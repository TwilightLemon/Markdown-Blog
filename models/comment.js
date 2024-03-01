const mongoose=require('mongoose')

const commentSchema=new mongoose.Schema({
    articleId:{
        type:String,
        required:true
    },
    comments:{
        type:[{email:String,comment:String}],
        required:true
    }

})
module.exports=mongoose.model('Comment',commentSchema)