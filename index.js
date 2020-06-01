var bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express();

//APP config
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

const database =  'mongodb+srv://areeb:zNntxsYsd8yhmYev@test-icewh.mongodb.net/test?retryWrites=true&w=majority' || 'mongodb://localhost:27017/yelpcamp';
mongoose.connect(database, { useNewUrlParser: true,useUnifiedTopology: true}, (err) => {
    if(err)
        console.log('Unable to connect to mongoDB servers');
    else 
        console.log('Connected to MongoDB servers');
});

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

//NEW ROUTE
app.get("/blogs/new", (req, res) => {
   res.render("new");
});

//CREATE ROUTE
app.post("/blogs", (req, res) => {
    // console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // console.log(req.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err){
            console.log(err);
        }
        else{
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