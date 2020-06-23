var Blogs = require('../models/blog'),
    BlogComment = require('../models/comment');
    
var middlewareObj = {};

middlewareObj.checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        // console.log(req.params.id);
        BlogComment.findById(req.params.comment_id, (err, foundComment) => {
            if(err){
                console.log(err);
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    eq.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    }else{
        eq.flash("error", "To add a comment, you need to be logged in.");
        res.redirect("back");
        
    }
}

middlewareObj.checkBlogOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        // console.log(req.params.id);
        Blogs.findById(req.params.id, (err, foundBlog) => {
            if(err){
                //console.log(err);
                req.flash("error", "Blog not found.");
                res.redirect("back");
            }else{
                // console.log(req.user._id);
                // console.log(foundCampground.author.id);
                if(foundBlog.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "To create a new blog, you need to be logged in.");
        res.redirect("back");
        
    }
}

middlewareObj.isLoggedIn =(req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login First!");
    res.redirect("/login");
}

module.exports = middlewareObj;