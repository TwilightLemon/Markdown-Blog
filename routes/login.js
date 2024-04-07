const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../apis/loginAuth');
const up = require("../apis/userProfile");


function setGlobalEncoder() {
    const js = `$(function(){
        $('form').on('submit',function(e){
            var pswInput = $(this).find('input[name="password"]');
            var ori= pswInput.val();
            if(ori!==undefined) {
                const key = CryptoJS.enc.Utf8.parse('thetorturedcatsdepartment');
                const iv = CryptoJS.enc.Utf8.parse('TW');
                const ciphertext = CryptoJS.AES.encrypt(ori, key, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                pswInput.val(ciphertext.toString());
                console.log(ciphertext.toString());
            }
        });
    });`;
    global.EncodedCrytoJS = btoa(js);
}

//Login Page
router.get('/', (req, res) => {
    setGlobalEncoder();
    res.render('account/login', {title:"Login",exist: false, confirmed: false, login: false, msg: ""});
});
router.get('/signout', (req, res) => {
    res.cookie('loginToken', '', {maxAge: 1});
    res.redirect('/');
});
router.post('/', async (req, res) => {
    console.log(req.body);
    if (req.body.email && req.body.password) {
        let user = await User.findOne({email: req.body.email});
        console.log(user);
        console.log(auth.signPsw(req.body.password));
        if (auth.signPsw(req.body.password) === user.saltedPsw) {
            auth.createLoginToken(res, user.email, user.saltedPsw);
            res.redirect('/');
        } else {
            res.render('account/login', {
                title:"Login",
                login: false,
                exist: true,
                confirmed: true,
                email: req.body.email,
                msg: "Wrong Password!"
            });
        }
    } else {
        let user = await User.findOne({email: req.body.email});
        if (user) {
            res.render('account/login', {
                title:"Login",
                login: false,
                exist: true,
                confirmed: true,
                email: req.body.email,
                msg: "welcome back, " + user.name + "!"
            });
        } else {
            //register
            const up = require('../apis/userProfile');
            let code = await up.sendVerificationCode(req.body.email);
            res.cookie('VerificationCode', auth.signPsw(code), {maxAge: 1000 * 60 * 5});
            res.render('account/login', {
                title:"Register",
                psw: "",
                name: "",
                login: false,
                exist: false,
                confirmed: true,
                email: req.body.email,
                msg: ""
            });
        }
    }
});

const resetHandler=async(req,res)=> {
    let loginData = await auth.checkLoginToken(req.cookies);
    let email = undefined;
    if (req.body.email)
        email = req.body.email;
    let check=true;
    if(loginData.login)
        check=loginData.user.email===email;
    if (email&&check) {
        const up = require('../apis/userProfile');
        let code = await up.sendVerificationCode(email);
        res.cookie('VerificationCode', auth.signPsw(code), {maxAge: 1000 * 60 * 5});
        res.render('account/login', {
            title:"Reset",
            psw: "",
            name: loginData.login ? loginData.user.name : "",
            login: false,
            exist: false,
            confirmed: true,
            email: email,
            msg: ""
        });
    } else {
        setGlobalEncoder();
        let wrong=!(req.body.email===undefined);
        res.render('account/login', {title:"Reset",exist: false, confirmed: false, login: false, msg: wrong?"Wrong Email!":"Verify your email:"});
    }
};
router.get('/reset',resetHandler);
router.post('/reset',resetHandler);

router.post('/reg', async (req, res) => {
    console.log(req.body);
    if (auth.signPsw(req.body.code) === req.cookies.VerificationCode) {
        let existUser=await User.findOne({email:req.body.email});
        let user=existUser?existUser:new User();
        user.signed=false;
        user.saltedPsw=req.body.password;
        user.name=req.body.name;
        user.email=req.body.email;
        await user.save();
        auth.createLoginToken(res, user.email, user.saltedPsw);
        res.redirect('/');
    } else {
        res.render('account/login', {
            title:"Register",
            psw: req.body.password,
            name: req.body.name,
            login: false,
            exist: false,
            confirmed: true,
            email: req.body.email,
            msg: "Wrong Verification Code!"
        });
    }
});


module.exports = router;