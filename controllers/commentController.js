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
    
    // Redirect back to post with a flag so the page can show a one-time confirmation
  res.redirect(`/post/${postId}?comment_submitted=1`);
} catch (error) {
  console.log(error);
  res.status(500).render("error", { message: 'Error creating comment' });
}
};
