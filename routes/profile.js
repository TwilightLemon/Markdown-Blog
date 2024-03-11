const express= require('express')
const router=express.Router()
const auth= require('../apis/loginAuth')
const usprof=require('../apis/userProfile')

router.get('/',async (req, res) => {
   let data=await auth.packConfWith(req.cookies, {})
    if(data.login)
        res.render('account/admin', data)
    else res.redirect('/')
})
router.post('/',async(req,res)=>{
    switch(req.body.method){
        case 'setName':
            let result=await usprof.setName(req.body.newName,req.cookies);
            res.json({success:result});
            break;
        default:
            res.json({msg:"参数呢？"});
            break;
    }
})

module.exports=router