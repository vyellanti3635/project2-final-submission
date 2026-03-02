const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { isAuthenticated } = require('../middleware/auth');
const { validateComment } = require('../middleware/validation');

router.post("/post/:id/comment", isAuthenticated, validateComment, commentController.create);

module.exports = router;
