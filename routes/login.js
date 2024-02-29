const express = require('express')
const router = express.Router()
const User = require('../models/user')
const auth = require('../apis/loginAuth')

//Login Page
router.get('/', (req, res) => {
    res.render('account/login',{exist:false,confirmed:false,login:false})
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
            res.render('account/login', {login:false,exist: true, confirmed: true,email: req.body.email})
        }
    }
    else {
        let user=await User.findOne({email:req.body.email})
        if (user) {
            res.render('account/login', {login:false,exist: true, confirmed: true,email: req.body.email})
        } else {
            //register
            res.render('account/login', {login:false,exist: false, confirmed: true,email: req.body.email})
        }
    }
})
router.post('/reg',async (req, res) => {
    console.log(req.body)
    let user= new User({
        email:req.body.email,
        saltedPsw:req.body.password,
        name:req.body.name
    })
    await user.save()
    auth.createLoginToken(res,user.email,user.saltedPsw,user.name);
    res.redirect('/')
})

module.exports=router