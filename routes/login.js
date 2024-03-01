const express = require('express')
const router = express.Router()
const User = require('../models/user')
const auth = require('../apis/loginAuth')

//Login Page
router.get('/', (req, res) => {
    res.render('account/login',{exist:false,confirmed:false,login:false,msg:""})
})
router.get('/signout', (req, res) => {
    res.cookie('loginToken', '', { maxAge: 1 });
    res.redirect('/')
})
router.post('/', async (req, res) => {
    console.log(req.body)
    if(req.body.email&&req.body.password){
        let user=await User.findOne({email:req.body.email})
        console.log(user)
        console.log(auth.signPsw(req.body.password))
        if(auth.signPsw(req.body.password)===user.saltedPsw){
            auth.createLoginToken(res,user.email,user.saltedPsw,user.name);
            res.redirect('/')
        }else{
            res.render('account/login', {login:false,exist: true, confirmed: true,email: req.body.email,msg:"Wrong Password!"})
        }
    }
    else {
        let user=await User.findOne({email:req.body.email})
        if (user) {
            res.render('account/login', {login:false,exist: true, confirmed: true,email: req.body.email,msg:"welcome back, "+user.name+"!"})
        } else {
            //register
            const up=require('../apis/userProfile')
            let code=await up.sendVerificationCode(req.body.email)
            res.cookie('VerificationCode',auth.signPsw(code),{maxAge:1000*60*5})
            res.render('account/login', {psw:"",name:"",login:false,exist: false, confirmed: true,email: req.body.email,msg:""})
        }
    }
})
router.post('/reg',async (req, res) => {
    console.log(req.body)
    if(auth.signPsw(req.body.code)===req.cookies.VerificationCode) {
        let user = new User({
            email: req.body.email,
            saltedPsw: req.body.password,
            name: req.body.name
        })
        await user.save()
        auth.createLoginToken(res, user.email, user.saltedPsw, user.name);
        res.redirect('/')
    }else{
        res.render('account/login', {psw: req.body.password,name: req.body.name,login:false,exist: false, confirmed: true,email: req.body.email,msg:"Wrong Verification Code!"})
    }
})

module.exports=router