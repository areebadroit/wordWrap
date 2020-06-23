var express = require('express');
var bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    path = require('path'),
    crypto = require('crypto'),
    multer = require('multer'),
    GridFsStorage = require('multer-gridfs-storage'),
    Grid = require('gridfs-stream');
var router = express.Router();

var Blog = require('../models/blog'),
BlogComment = require('../models/comment');

var middleware = require('../middleware');//index.js file contents will be taken automatically

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

  router.get("/profile", middleware.isLoggedIn, (req, res) => {
    // console.log(req.user);
    Blog.find({}, (err,allBlogs) => {
        if(err){
            console.log(err);
        }else{
            res.render("profile", {blogs: allBlogs, currentUser: req.user});
        }
    });
});

//SHOW - show all campgrounds in database
router.get("/blogs", (req, res) => {
    // console.log(req.user);
    Blog.find({},null, {sort:{_id: -1}}, (err,allBlogs) => {
        if(err){
            console.log(err);
        }else{
            res.render("blogs", {blogs: allBlogs, currentUser: req.user});
        }
    });
});

router.get("/files",(req, res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files||files.length === 0){
            console.log(err);
        }
        return res.json(files);
    });
});

router.get("/files/:filename",(req, res)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file)=>{
        if(!file||file.length === 0){
            console.log(err);
        }
        return res.json(file);
    });
});

router.get("/image/:filename",(req, res)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file)=>{
        if(!file||file.length === 0){
            console.log(err);
        }
        //check image
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/jpg'){
        var readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
        }else{
            res.status(404).json({
                err:'Not an image of type jpeg/png'
            })
        }
    }); 
});

//CREATE - add new campground to DB
router.post("/blogs",  middleware.isLoggedIn, upload.single('file'), (req, res) => {
    console.log(req.body);
    var name = req.body.name;
    var image = req.file.filename;
    var description = req.body.description;
    var newBlog = {title: name, image: image, body: description};
    console.log(newBlog);
    //campgrounds.push();
    Blog.create(newBlog, (err, blog) => {
        if(err){
            console.log(err);
        }else{
            blog.author.id = req.user._id;
            blog.author.username = req.user.username;
            blog.author.name = req.user.name;
            blog.save();
            console.log(blog);
            res.redirect("/blogs");
        }
    });
});

//NEW - show form to create new campground
router.get("/blogs/new", middleware.isLoggedIn, (req, res) => {
    res.render("new")
});

//SHOW - show more info about one campground
router.get("/blogs/:id", (req, res) => {
    //find campground with provided id
    Blog.findById(req.params.id).populate("comments").exec( (err, foundBlog) => {
        if(err){
            console.log(err);
        }else{
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT
router.get("/blogs/:id/edit", middleware.checkBlogOwnership,(req, res) => {
    //find campground with provided id 
    //is user logged in
        //does he own the campground
        Blog.findById(req.params.id, (err, foundBlog) => {
            res.render("edit", {blog: foundBlog});
        });
});

router.put("/blogs/:id", middleware.checkBlogOwnership, (req, res) => {
    //find campground with provided id and edit
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var updateBlog = {title: name, image: image, body: description};
    Blog.findByIdAndUpdate(req.params.id, updateBlog, (err, foundBlog) => {
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});
//DELETE
router.delete("/blogs/:id", middleware.checkBlogOwnership,(req, res) => {
    //find campground with provided id and delete
    Blog.findByIdAndDelete(req.params.id,  (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        }else{
            BlogComment.remove({}, function(err) {
                if(err){
                    console.log(err);
                }
            res.redirect("/profile");
        });
        }
});
});

module.exports = router;