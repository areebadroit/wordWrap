var bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    mongoose = require('mongoose'),
    express = require('express'),
    path = require('path'),
    crypto = require('crypto'),
    multer = require('multer'),
    GridFsStorage = require('multer-gridfs-storage'),
    Grid = require('gridfs-stream'),
    app = express();

//APP config//MiddleWare
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

//Mongoose URL
const database =  'mongodb+srv://areeb:zNntxsYsd8yhmYev@test-icewh.mongodb.net/test?retryWrites=true&w=majority' || 'mongodb://localhost:27017/yelpcamp';
//Mongo CONNECTION
mongoose.connect(database, { useNewUrlParser: true,useUnifiedTopology: true}, (err) => {
    if(err)
        console.log('Unable to connect to mongoDB servers');
    else 
        console.log('Connected to MongoDB servers');
});
var gfs;
var conn = mongoose.createConnection(database);
conn.once('open', function () {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('blogs');
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
            bucketName: 'blogs'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });
//MONGOOSE config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    author: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image:"https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60.jpg",
//     body: "Hello this is a blog post!"
// });

//RESTFUL ROUTES
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err){
            console.log(err);
        }else{
            res.render("blogs", {blogs: blogs});
        }
    });
});

app.get("/files",(req, res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files||files.length === 0){
            console.log(err);
        }
        return res.json(files);
    });
    
});

app.get("/files/:filename",(req, res)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file)=>{
        if(!file||file.length === 0){
            console.log(err);
        }
        return res.json(file);
    });
    
});

app.get("/image/:filename",(req, res)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file)=>{
        if(!file||file.length === 0){
            console.log(err);
        }
        //check image
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/jpeg'){
        var readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
        }else{
            res.status(404).json({
                err:'Not an image of type jpeg/png'
            })
        }
    });
    
});

//NEW ROUTE
app.get("/blogs/new", (req, res) => {
   res.render("new");
});

//CREATE ROUTE
app.post("/blogs", upload.single('file'), (req, res) => {
    // console.log(req.body);
    // req.body.blog.body = req.sanitize(req.body.blog.body);
    // console.log(req.body);
    var title = req.sanitize(req.body.title);
    var author = req.sanitize(req.body.author);
    var body = req.sanitize(req.body.body);
    var imageName = req.file.filename;
    var newBlog = {title: title, image: imageName, body: body, author: author};
    Blog.create(newBlog, (err, newBlog) => {
        if(err){
            console.log(err);
        }
        else{
            console.log(req.file);
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    });
});

app.get("/blogs/:id/edit", (req, res) => {
    //create blog
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/:id");
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs");
        }
    });
});



app.listen(process.env.PORT || 4000, () => {
    console.log(`The wordWrap Server has started`);
});