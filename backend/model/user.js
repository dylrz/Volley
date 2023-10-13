const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        // required: true,
        unique: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Let passportLocalMongoose handle the hashing and salting of the password
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);