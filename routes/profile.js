const express= require('express')
const router=express.Router()
const auth= require('../apis/loginAuth')

router.get('/',async (req, res) => {
    res.render('account/admin', await auth.packConfWith(req.cookies, {}))
})

module.exports=router