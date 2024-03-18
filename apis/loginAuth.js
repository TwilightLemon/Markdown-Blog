const crypto = require('crypto');

// Salt used for hashing
let salt = "thetorturedpoemsdepartment";

/**
 * Hashes a password using MD5.
 *
 * @param {string} psw - The password to hash.
 * @returns {string} The hashed password.
 */
function signPsw(psw) {
    return crypto.createHash('md5').update(salt + psw).digest('hex');
}

module.exports.signPsw = signPsw;

/**
 * Creates a login token and sets it as a cookie.
 *
 * @param {object} res - The response object.
 * @param {string} email - The user's email.
 * @param {string} saltedPsw - The salted password.
 * @param {string} name - The user's name.
 */
function createLoginToken(res, email, saltedPsw, name) {
    let token = crypto.createHash('sha256').update(salt + email + salt + saltedPsw).digest('hex');
    let conf = {httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 * 7};
    res.cookie('loginToken', token, conf);
    res.cookie('email', email, conf);
}

module.exports.createLoginToken = createLoginToken;

/**
 * Checks if the login token from the cookies is valid.
 *
 * @param {object} cookies - The cookies from the request.
 * @returns {object} An object containing the login status and the user data if logged in.
 */
async function checkLoginToken(cookies) {
    let result = {
        login: false,
        user: null
    };
    if (cookies.loginToken && cookies.email) {
        const User = require('../models/user');
        let user = await User.findOne({email: cookies.email});
        if (user) {
            let token = crypto.createHash('sha256').update(salt + cookies.email + salt + user.saltedPsw).digest('hex');
            if (token === cookies.loginToken) {
                result.user = user;
                result.login = true;
            }
        }
    }
    return result;
}

module.exports.checkLoginToken = checkLoginToken;

/**
 * Packs the configuration with the login data.
 *
 * @param {object} cookies - The cookies from the request.
 * @param {object} conf - The configuration to pack with the login data.
 * @returns {object} The packed configuration.
 */
async function packConfWith(cookies, conf) {
    console.log(cookies);
    let data = await checkLoginToken(cookies);
    if (data.login) {
        console.log("logged in");
        let newConf = {
            ...conf,
            login: true,
            login_email: data.user.email,
            login_nickname: data.user.name,
            login_auth: data.user.auth
        };
        console.log(newConf);
        return newConf;
    }
    return {
        ...conf,
        login: false
    };
}

module.exports.packConfWith = packConfWith;