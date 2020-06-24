//===============================================ROUTES====================================================

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    path = require('path'),
    crypto = require('crypto'),
    multer = require('multer'),
    GridFsStorage = require('multer-gridfs-storage'),
    Grid = require('gridfs-stream');
var passport = require('passport');
var BlogUser = require('../models/user');

const database =  'mongodb+srv://areeb:zNntxsYsd8yhmYev@test-icewh.mongodb.net/test?retryWrites=true&w=majority' || 'mongodb://localhost:27017/yelpcamp';

var gfs;
var conn = mongoose.createConnection(database);
conn.once('open', function () {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('wordWrapBlogs');
  // all set!
});

var storage = new GridFsStorage({
    url: database,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'wordWrapBlogs'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

  router.get("/image/:filename",(req, res)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file)=>{
        if(!file||file.length === 0){
            console.log(err);
        }
        //check image
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/png'){
        var readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
        }else{
            res.status(404).json({
                err:'Not an image of type jpeg/png'
            })
        }
    }); 
});

router.get("/register", (req,res) => {
    res.render("register");
});

//handling user signup
router.post("/register", upload.single('file'), (req,res) => {
    var uname = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    var dob = req.body.dob;
    var contact = req.body.contact;
    var email = req.body.email;
    var pp = req.file.filename;
    BlogUser.register(new BlogUser({username: uname, name:name, dob:dob, contact:contact, email:email, pp:pp}), password, (err, user) => {
        if(err){
            //console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
            //return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome to wordWrap "+ uname);
            res.redirect("/blogs");
        });
    });
});

//login route
router.get("/login", (req,res) => {
    res.render("login");
});
//login logic
//middleware
router.post("/login", passport.authenticate("local", {
    successRedirect: "blogs",
    failureRedirect: "back",
    failureFlash: true
}), (req, res) => {

});

//logout
router.get("/logout", (req,res) => {
    req.logout();
    req.flash("success", "Succesfully logged out.");
    res.redirect("/blogs");
});

//INDEX
router.get("/", (req, res) => {
    res.render("landing");
});

module.exports = router;