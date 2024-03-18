const mongoose = require('mongoose');
const auth = require('../apis/loginAuth');

const userSheme = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    saltedPsw: {
        type: String,
        required: true
    },
    /// 0: admin,1: normal user
    auth: {
        type: Number,
        required: false
    },
    signed: {
        type: Boolean,
        required: false
    }
});

userSheme.pre('validate', function (next) {
    if (!this.signed) {
        this.saltedPsw = auth.signPsw(this.saltedPsw);
        this.signed = true;
    }
    if (this.auth == null) {
        this.auth = 1;
    }
    next();
});
userSheme.post('findOne', function (doc) {
    if (doc && doc.auth == null)
        doc.auth = 1;
});
module.exports = mongoose.model('User', userSheme);
