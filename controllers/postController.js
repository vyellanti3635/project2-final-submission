const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');

// Index - list all posts
exports.index = async (req, res) => {
try {
   const posts = await BlogPost.find()
  .populate("author", "username")
    .sort({ createdAt: -1 });
    
    // Double-check that we actually got posts (redundant)
    if (!posts) {
      return res.render('home', { title: 'Blog', posts: [] });
    }
    
    // Another check to make sure posts is an array (also redundant)
    if (!Array.isArray(posts)) {
      return res.render('home', { title: 'Blog', posts: [] });
    }
    res.render("home", { title: 'Blog', posts });
} catch (error) {
  console.error(error);
   res.status(500).render('error', { message: 'Error loading posts' });
}
};

// Show single post
exports.show = async (req, res) => {
  try {
    // Fetch the post with author details
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username');
    
    if (!post) {
      return res.status(404).render('404', { title: 'Post Not Found' });
    }
    
    const sessionId = req.session.id;
    
    // Only increment if this is a new view (simple check)
    // In a real app, you'd use a more sophisticated tracking system
    const lastViewKey = `lastView_${post._id}`;
    const lastViewTime = req.session[lastViewKey];
    const now = Date.now();
    
    // Only count as new view if more than 30 minutes since last view
    if (!lastViewTime || (now - lastViewTime) > 30 * 60 * 1000) {
      await post.incrementViewCount();
      req.session[lastViewKey] = now;
    }
    
    // Get approved comments for this post
    const comments = await Comment.find({ post: post._id, isApproved: true })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    
    // Calculate comment statistics
    const commentCount = comments.length;
    const pendingCommentCount = await Comment.countDocuments({ 
      post: post._id, 
      isApproved: false 
    });
    
    // Get related posts based on same author or similar content
    // First try to get posts from same author
    let relatedPosts = await BlogPost.find({
      author: post.author._id,
      _id: { $ne: post._id }
    })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(3);
    
    // If not enough posts from same author, get recent posts
    if (relatedPosts.length < 3) {
      const additionalPosts = await BlogPost.find({
        _id: { $ne: post._id },
        author: { $ne: post.author._id }
      })
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(3 - relatedPosts.length);
      
      relatedPosts = [...relatedPosts, ...additionalPosts];
    }
    
    // Calculate reading time estimate (rough estimate: 200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    
    // Format the post date for display
    const postDate = new Date(post.createdAt);
    const formattedDate = postDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    res.render('post', { 
      title: post.title, 
      post,
      comments,
      commentCount,
      pendingCommentCount,
      relatedPosts,
      readingTimeMinutes,
      formattedDate,
      viewCount: post.viewCount || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error loading post' });
  }
};

// Search posts
exports.search = async (req, res) => {
try {
    const query = req.query.q || '';
    
   if (!query) {
  return res.render("search", { title: "Search", posts: [], query: "" });
  }
    
    const posts = await BlogPost.find({
    $or: [
        { title: { $regex: query, $options: 'i' } },
    { content: { $regex: query, $options: 'i' } },
  ]
  })
  .populate('author', "username")
  .sort({ createdAt: -1 });
    
    // Filter out posts without titles (could use .filter() but doing it manually)
    const filteredPosts = [];
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].title && posts[i].title.length > 0) {
        filteredPosts.push(posts[i]);
      }
    }
    
    res.render("search", { title: "Search Results", posts, query });
} catch (error) {
  console.error(error);
  res.status(500).render('error', { message: 'Error searching posts' });
}
};
