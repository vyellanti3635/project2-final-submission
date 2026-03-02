const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.get('/', postController.index);

router.get('/post/:id', postController.show);

router.get('/search', postController.search);

module.exports = router;
