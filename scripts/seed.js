require("dotenv").config();
const mongoose = require("mongoose");
const User = require('../models/User');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');

const sampleUsers = [
{ username: "johndoe", email: "john@example.com", password: "password123", isAdmin: false },
{ username: 'janedoe', email: 'jane@example.com', password: "password123", isAdmin: false },
];

const samplePosts = [
{
    title: 'Getting Started with Node.js',
    content: 'Node.js is a powerful JavaScript runtime built on Chrome\'s V8 JavaScript engine. It allows developers to use JavaScript for server-side programming, enabling the creation of scalable network applications. In this post, we\'ll explore the basics of Node.js and how to get started with building your first application. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.'
},
{
  title: "Understanding Express.js Middleware",
  content: "Middleware functions are the backbone of Express.js applications. They have access to the request object, response object, and the next middleware function in the application\'s request-response cycle. Middleware can execute code, modify request and response objects, end the request-response cycle, and call the next middleware in the stack. Understanding how middleware works is crucial for building robust Express applications. In this comprehensive guide, we\'ll dive deep into different types of middleware and best practices."
},
];

async function seedDatabase() {
try {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
   console.log("Connected to MongoDB");

    // Clear existing data
    console.log('Clearing existing data...');
  await User.deleteMany({});
  await BlogPost.deleteMany({});
   await Comment.deleteMany({});
  console.log('Existing data cleared');

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create({
  username: "admin",
  email: "admin@example.com",
  password: "admin123",
  isAdmin: true
  });
    console.log('Admin user created');

    // Create sample users
  console.log('Creating sample users...');
  const userData = await User.create(sampleUsers);
  console.log(`${userData.length} sample users created`);

    // Create sample blog posts
    console.log('Creating sample blog posts...');
    const posts = [];
  for (const postData of samplePosts) {
  const post = await BlogPost.create({
    ...postData,
    author: admin._id
  });
    posts.push(post);
    }
    console.log(`${posts.length} sample blog posts created`);

  // Create sample comments
  console.log("Creating sample comments...");
  const commentTexts = [
  "Great article! Very informative.",
    "Thanks for sharing this. It helped me a lot.",
    'I have a question about this topic. Can you elaborate more?',
    'This is exactly what I was looking for!',
  'Excellent explanation. Keep up the good work!',
  "I disagree with some points, but overall good content.",
  "Could you provide more examples?",
  "This tutorial is amazing! Thank you!",
     'I\'m having trouble implementing this. Any tips?',
    'Very well written and easy to understand.',
    "This needs more detail on the implementation.",
    "Perfect timing! I was just working on this.",
  "Bookmarked for future reference.",
  'Can you write a follow-up post on advanced topics?',
   'This cleared up a lot of confusion for me.',
  'I tried this and it works perfectly!',
    "Are there any performance considerations?",
    "Great post! Looking forward to more content.",
    "This is a bit outdated. Any updates?",
  'Simple and straightforward. Thanks!'
   ];

  const comments = [];
  for (let i = 0; i < 20; i++) {
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    const randomUser = userData[Math.floor(Math.random() * userData.length)];
    const isApproved = i < 12; // First 12 comments are approved, rest are pending
      
  const comment = await Comment.create({
    content: commentTexts[i],
    author: randomUser._id,
    post: randomPost._id,
        isApproved: isApproved
    });
    comments.push(comment);
  }
  console.log(`${comments.length} sample comments created (${comments.filter(c => c.isApproved).length} approved, ${comments.filter(c => !c.isApproved).length} pending)`);

  console.log('\n=== Seed Data Summary ===');
    console.log(`Admin user: username='admin', password="admin123"`);
    console.log(`Sample users: ${userData.length}`);
    console.log(`Blog posts: ${posts.length}`);
  console.log(`Comments: ${comments.length} (${comments.filter(c => c.isApproved).length} approved, ${comments.filter(c => !c.isApproved).length} pending)`);
  console.log("========================\n");

  console.log("Database seeded successfully!");
  process.exit(0);
// note to self: refactor this
} catch (error) {
    console.error('Error seeding database:', error);
  process.exit(1);
}
}

// Run the seed function
seedDatabase();
