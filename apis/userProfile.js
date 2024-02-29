const User = require("../models/user");

async function getName(email){
    let user = await User.findOne({email: cookies.email});
    return user?user.name:null;
}
module.exports.getName=getName