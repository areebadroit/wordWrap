var mongoose = require("mongoose");
 
var wordWrapcommentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "wordWrapUser"
        },
    username: String
    }
});
 
module.exports = mongoose.model("wordWrapComment", wordWrapcommentSchema);