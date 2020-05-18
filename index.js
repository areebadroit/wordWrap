var bodyParser = require('body-parser'),
    mongoose = require('mongoose')
    express = require('express'),
    app = express();

//APP config
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const database =  'mongodb+srv://areeb:5m3uR2CfNntiqbLb@test-icewh.mongodb.net/test?retryWrites=true&w=majority' || 'mongodb://localhost:27017/yelpcamp';
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

app.get("/blogs/new", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err){
            console.log(err);
        }else{
            res.render("new", {blogs: blogs});
        }
    });
});

app.post("/blogs", (req, res) => {
    //create blog
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/blogs");
        }
    });
});
app.listen(process.env.PORT || 3000, () => {
    console.log(`The wordWrap Server has started`);
});