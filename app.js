require('dotenv').config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require('method-override');
const path = require('path');

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', "application/manifest+json");
     res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(path.join(__dirname, "public", 'manifest.json'));
});

app.get('/service-worker.js', (req, res) => {
	res.setHeader("Content-Type", "application/javascript");
	res.setHeader("Cache-Control", "no-cache");
 res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

app.get("/offline", (req, res) => {
  res.render("offline", { title: "Offline" });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

const sanitizationMiddleware = require("./middleware/sanitization");
app.use(sanitizationMiddleware);

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
    cookie: {
       maxAge: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true,
		secure: false
	}
}));

require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.user = req.user;
    next();
});

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");

app.use("/", authRoutes);
app.use('/', postRoutes);
app.use('/', commentRoutes);
app.use('/', contactRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
	res.status(404).render("404", { title: "Page Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: err.message,
    error: err
  });
});

module.exports = app;
