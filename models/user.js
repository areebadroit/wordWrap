var mongoose = require('mongoose');
PassportLocalMongoose = require('passport-local-mongoose');

var wordWrapUserSchema = new mongoose.Schema({
    username: String,
    name: String,
    dob: {type: Date},
    contact: String,
    email: String,
    pp: String,
    password: String
});

wordWrapUserSchema.plugin(PassportLocalMongoose);

module.exports = mongoose.model("wordWrapUser", wordWrapUserSchema);