const mongoose=require('mongoose')
const auth=require('../apis/loginAuth')

const userSheme=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    saltedPsw:{
        type:String,
        required:true
    }
});

userSheme.pre('validate',function(next){
    this.saltedPsw=auth.signPsw(this.saltedPsw)
    next()
})
module.exports=mongoose.model('User',userSheme)
