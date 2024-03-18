const User = require("../models/user");
const emailService = require("nodemailer");
const auth = require("../apis/loginAuth");

async function sendVerificationCode(email) {
    let sender = emailService.createTransport({
        host: 'smtp.qiye.aliyun.com',
        port: 465,
        secure: true,
        auth: {
            user: 'blogadmin@twlm.space',
            pass: 'sS5Xc0zt7pCeaqL4'
        }
    });
    let code = Math.floor(Math.random() * 1000000);
    let info = await sender.sendMail({
        from: 'BlogAdmin@twlm.space',
        to: email,
        subject: 'Verification Code',
        text: `Your verification code is ${code}`
    });
    return code;
}

module.exports.sendVerificationCode = sendVerificationCode;

async function getName(email) {
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