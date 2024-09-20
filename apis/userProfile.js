const User = require("../models/user");
const emailService = require("nodemailer");
const auth = require("../apis/loginAuth");

async function sendVerificationCode(email) {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const key = process.env.SMTP_KEY;
    if(host==undefined||user==undefined||key==undefined) return null;
    
    let sender = emailService.createTransport({
        host: host,
        port: 465,
        secure: true,
        auth: {
            user: user,
            pass: key
        }
    });
    let code = Math.floor(Math.random() * 1000000);
    let info = await sender.sendMail({
        from: user,
        to: email,
        subject: '[Twlm\' s Blog]Verification Code',
        text: `Your verification code is ${code}`
    });
    return code;
}

module.exports.sendVerificationCode = sendVerificationCode;

async function getName(email) {
    if(email === null) return null;
    let user = await User.findOne({email: email});
    return user ? user.name : null;
}

module.exports.getName = getName;

async function setName(newName, cookies) {
    let authData = await auth.checkLoginToken(cookies);
    if (authData) {
        let user = authData.user;
        user.name = newName;
        user.save();
        return true;
    }
    return false;
}

module.exports.setName = setName;