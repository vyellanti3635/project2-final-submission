const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');

// Create new comment
exports.create = async (req, res) => {
try {
   const { content } = req.body;
  const postId = req.params.id;
    
    // Verify post exists
    const post = await BlogPost.findById(postId);
    
   if (!post) {
  return res.status(404).render("404", { title: "Post Not Found" });
  }
    
    // Create comment
    const comment = new Comment({
    content,
  author: req.user._id,
  post: postId,
  isApproved: false
  });
    
    await comment.save();
    
    // Redirect back to post
  res.redirect(`/post/${postId}`);
} catch (error) {
  console.log(error);
  res.status(500).render("error", { message: 'Error creating comment' });
}
};
