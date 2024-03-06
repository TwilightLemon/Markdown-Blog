const crypto = require('crypto');

let salt="thetorturedpoemsdepartment";
function signPsw(psw) {
    return crypto.createHash('md5').update(salt+psw).digest('hex')
}
module.exports.signPsw=signPsw

function createLoginToken(res,email,saltedPsw,name){
    let token=crypto.createHash('sha256').update(salt+email+salt+saltedPsw).digest('hex');
    let conf={httpOnly:true,secure:true,maxAge:1000*60*60*24*7};
    res.cookie('loginToken',token,conf);
    res.cookie('email',email,conf);
    res.cookie('name',name,conf);
}
module.exports.createLoginToken=createLoginToken
async function checkLoginToken(cookies) {
    let result={
        login:false,
        user:null
    }
    if (cookies.loginToken && cookies.email && cookies.name) {
        const User = require('../models/user');
        let user = await User.findOne({email: cookies.email});
        if (user) {
            let token = crypto.createHash('sha256').update(salt + cookies.email + salt + user.saltedPsw).digest('hex');
            if (token === cookies.loginToken) {
                result.user=user
                result.login=true
            }
        }
    }
    return result
}
module.exports.checkLoginToken=checkLoginToken

async function packConfWith(cookies,conf){
    console.log(cookies)
    let data=await checkLoginToken(cookies)
    if(data.login) {
        console.log("logged in")
        let newConf={
            ...conf,
            login: true,
            login_email: cookies.email,
            login_nickname: cookies.name,
            login_auth: data.user.auth
        }
        console.log(newConf)
        return newConf;
    }
    return {
        ...conf,
        login: false
    }
}
module.exports.packConfWith=packConfWith