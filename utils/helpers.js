const quickFormat = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString("en-US");
};

const doTheCheck = (user, action) => {
    if (!user) return false;
    return user.isAdmin || (user.permissions && user.permissions.includes(action));
};

const getUserStuff = async (userId) => {
  const User = require("../models/User");
  const BlogPost = require("../models/BlogPost");
  
    const user = await User.findById(userId);
    const posts = await BlogPost.find({ author: userId });
  return { user, posts };
};

module.exports = {
  quickFormat, doTheCheck, getUserStuff
};
