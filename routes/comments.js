var express = require('express');
var router = express.Router();

var Blog = require('../models/blog'),
BlogComment = require('../models/comment');

var middleware = require('../middleware');//index.js file contents will be taken automatically

router.get("/blogs/:id/comments/new",  middleware.isLoggedIn, (req, res) => {
    res.render("comments/new");
});

router.post("/blogs/:id/comments/new", middleware.isLoggedIn, (req, res) => {
    Blog.findById(req.params.id, (err, blog) => {
        var postId = req.params.id;
        if(err){
            res.redirect("/blogs/" + postId);
        }else{
            var text =req.body.text;
            //var author =req.body.author;
            var comm = {text: text}
            BlogComment.create(comm, (err, newComment) => {
                if(err){
                    req.flash("error", "Something went wrong.");
                    //console.log(err);
                }else{
                    //console.log(newComment);
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    blog.comments.push(newComment);
                    blog.save();
                    req.flash("success", "Successfully added a comment.");
                    res.redirect("/blogs/"+ postId);
                }
            });
        }
    });
});

router.get("/blogs/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    BlogComment.findById(req.params.comment_id, (err, foundComment) => {
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit", {blog_id:req.params.id, comment: foundComment});
        }
    });
});

router.put("/blogs/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    BlogComment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, foundComment) => {
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

router.delete("/blogs/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    BlogComment.findByIdAndDelete(req.params.comment_id, (err, foundComment) => {
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

module.exports = router;