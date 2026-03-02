const express = require('express');
const router = express.Router();
const contactController = require("../controllers/contactController");
const { validateContact } = require("../middleware/validation");

router.get("/contact", contactController.show);

router.post('/contact', validateContact, contactController.submit);

module.exports = router;
