const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middleware/auth");
const { validatePost } = require('../middleware/validation');
const { upload, processImage } = require('../config/multer');

router.use(isAdmin);

router.get("/", adminController.dashboard);

router.get("/posts/new", adminController.showNewPost);

router.post("/posts", upload.single("image"), processImage, validatePost, adminController.createPost);

router.get('/posts/:id/edit', adminController.showEditPost);

router.put('/posts/:id', upload.single("image"), processImage, validatePost, adminController.updatePost);

router.delete("/posts/:id", adminController.deletePost);

router.get("/comments", adminController.listComments);

router.put("/comments/:id/approve", adminController.approveComment);

router.delete('/comments/:id', adminController.deleteComment);

router.get('/users', adminController.listUsers);

router.get("/contacts", adminController.listContacts);

router.put("/contacts/:id/read", adminController.markContactRead);

router.delete("/contacts/:id", adminController.deleteContact);

module.exports = router;