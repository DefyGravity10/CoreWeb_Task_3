var mongoose = require('mongoose');
var passportLocalMongoose=require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
    email: {
    type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,   
        unique: true,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    cart: {
        type: Array
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);