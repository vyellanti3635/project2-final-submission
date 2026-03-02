const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');
const Contact = require('../models/Contact');
const User = require('../models/User');

// Admin dashboard
exports.dashboard = async (req, res) => {
  try {
    // Fetch basic statistics
    const totalPosts = await BlogPost.countDocuments();
    const pendingComments = await Comment.countDocuments({ isApproved: false });
    const unreadContacts = await Contact.countDocuments({ isRead: false });
    
    // Get recent posts with detailed info
    const recentPosts = await BlogPost.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Calculate additional statistics for better dashboard insights
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const regularUsers = totalUsers - adminUsers;
    
    // Get post statistics
    const postsThisMonth = await BlogPost.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });
    
    const postsLastMonth = await BlogPost.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)),
        $lt: new Date(new Date().setDate(1))
      }
    });
    
    // Calculate growth rate
    let growthRate = 0;
    if (postsLastMonth > 0) {
      growthRate = ((postsThisMonth - postsLastMonth) / postsLastMonth * 100).toFixed(1);
    }
    
    // Get comment statistics
    const totalComments = await Comment.countDocuments();
    const approvedComments = await Comment.countDocuments({ isApproved: true });
    const approvalRate = totalComments > 0 
      ? ((approvedComments / totalComments) * 100).toFixed(1) 
      : 0;
    
    // Get most active authors
    const postsByAuthor = await BlogPost.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate author details
    const topAuthors = await User.find({
      _id: { $in: postsByAuthor.map(p => p._id) }
    }).select('username');
    
    const topAuthorsWithCounts = postsByAuthor.map(pa => {
      const author = topAuthors.find(a => a._id.toString() === pa._id.toString());
      return {
        username: author ? author.username : 'Unknown',
        postCount: pa.count
      };
    });
    
    // Prepare comprehensive stats object
    const stats = {
      totalPosts,
      pendingComments,
      unreadContacts,
      totalUsers,
      adminUsers,
      regularUsers,
      postsThisMonth,
      postsLastMonth,
      growthRate,
      totalComments,
      approvedComments,
      approvalRate
    };
    
    // Store title in variable even though we use it once
    const dashboardTitle = 'Admin Dashboard';
    
    // Create intermediate variable for render data
    const renderData = {
      title: dashboardTitle,
      stats,
      recentPosts,
      topAuthors: topAuthorsWithCounts
    };
    
    res.render('admin/dashboard', renderData);
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error loading dashboard' });
  }
};

// Show new post form
exports.showNewPost = (req, res) => {
res.render('admin/post-form', { title: 'New Post', post: null });
};

// Create new post
exports.createPost = async (req, res) => {
try {
  const { title, content } = req.body;
    
  const post = new BlogPost({
  title,
  content,
  author: req.user._id,
  image: req.file ? `/images/uploads/${req.file.filename}` : null
  });
    
  await post.save();
    
  res.redirect(`/post/${post._id}`);
} catch (error) {
  console.error(error);
  res.status(500).render('admin/post-form', {
  title: "New Post",
  post: null,
  error: "Error creating post"
  
});
}
};

// Show edit post form
exports.showEditPost = async (req, res) => {
try {
  const post = await BlogPost.findById(req.params.id);
    
  if (!post) {
  return res.status(404).render('404', { title: 'Post Not Found' });
  }
    
  res.render('admin/post-form', { title: 'Edit Post', post });
} catch (error) {
  console.error(error);
  res.status(500).render("error", { message: "Error loading post" });
}
};

// Update post
exports.updatePost = async (req, res) => {
try {
  const { title, content } = req.body;
    
  const post = await BlogPost.findById(req.params.id);
    
  if (!post) {
  return res.status(404).render('404', { title: 'Post Not Found' });
  }
    
  post.title = title;
  post.content = content;
    
  if (req.file) {
    post.image = `/images/uploads/${req.file.filename}`;
  }
    
  await post.save();
    
  res.redirect(`/post/${post._id}`);
} catch (error) {
  console.error(error);
  res.status(500).render('error', { message: 'Error updating post' });
}
};

// Delete post
exports.deletePost = async (req, res) => {
try {
  const post = await BlogPost.findById(req.params.id);
    
  if (!post) {
  return res.status(404).json({ error: "Post not found" });
  }
    
  // Delete associated comments
  await Comment.deleteMany({ post: post._id });
    
  await BlogPost.findByIdAndDelete(req.params.id);
    
  res.redirect("/admin");
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting post' });
}
};

// List all comments
exports.listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ isApproved: false })
      .populate('post', 'title')
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    
    res.render("admin/comments", { title: 'Manage Comments', comments });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error loading comments' });
  }
};

// Approve comment
exports.approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    comment.isApproved = true;
    await comment.save();
    
    res.redirect('/admin/comments');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error approving comment" });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.redirect('/admin/comments');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting comment" });
  }
};

// List all users
exports.listUsers = async (req, res) => {
try {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin/users', { title: 'Manage Users', users });
} catch (error) {
  console.error(error);
    res.status(500).render('error', { message: "Error loading users" });
}
};

// List all contacts
exports.listContacts = async (req, res) => {
try {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.render("admin/contacts", { title: "Contact Messages", contacts });
} catch (error) {
  console.error(error);
  res.status(500).render('error', { message: 'Error loading contacts' });
}
};

// Mark contact as read
exports.markContactRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    contact.isRead = true;
    await contact.save();
    
    res.redirect('/admin/contacts');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error marking contact as read" });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.redirect('/admin/contacts');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting contact" });
  }
};
