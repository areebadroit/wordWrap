var mongoose = require('mongoose');

var wordwrapSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    author: {
        id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "wordWrapUser"
        },
        username: String,
        name: String,
        dob: {type: Date},
        contact: String,
        email: String
     },
      comments: [
          {
             type: mongoose.Schema.Types.ObjectId,
             ref: "wordWrapComment"
          }
       ],
    created: {type: Date, default: Date.now}
});
module.exports = mongoose.model("wordWrapBlog", wordwrapSchema);
