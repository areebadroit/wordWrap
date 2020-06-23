const bodyParser = require('body-parser'),
    flash = require('connect-flash'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    mongoose = require('mongoose'),
    express = require('express'),
    path = require('path'),
    crypto = require('crypto'),
    multer = require('multer'),
    GridFsStorage = require('multer-gridfs-storage'),
    Grid = require('gridfs-stream'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    PassportLocalMongoose = require('passport-local-mongoose'),
    app = express();

var Blogs = require('./models/blog'),
    BlogComment = require('./models/comment'),
    BlogUser = require('./models/user');

var commentRoutes = require('./routes/comments'),
    blogRoutes = require('./routes/blogs'),
    indexRoutes = require('./routes/index');

//Mongoose URL
const database =  'mongodb+srv://areeb:zNntxsYsd8yhmYev@test-icewh.mongodb.net/test?retryWrites=true&w=majority' || 'mongodb://localhost:27017/yelpcamp';
//Mongo CONNECTION
mongoose.connect(database, { useNewUrlParser: true,useUnifiedTopology: true}, (err) => {
    if(err)
        console.log('Unable to connect to mongoDB servers');
    else 
        console.log('Connected to MongoDB servers');
});

//==================================================================================================

app.use(require("express-session")({
    secret: "Lets be smart and hash our password because privacy matters",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(BlogUser.authenticate()));
passport.serializeUser(BlogUser.serializeUser());
passport.deserializeUser(BlogUser.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use(blogRoutes);
app.use(commentRoutes);



app.listen(process.env.PORT || 4000, () => {
    console.log(`The wordWrap Server has started`);
});