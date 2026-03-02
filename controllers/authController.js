const User = require('../models/User');
const passport = require('passport');

// Show registration form
exports.showRegister = (req, res) => {
res.render('register', { title: 'Register' });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input fields
    const errors = [];
    
    if (!username || username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (!email || !email.includes('@')) {
      errors.push('Please provide a valid email address');
    }
    
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'abc123'];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too weak. Please choose a stronger password');
    }
    
    if (errors.length > 0) {
      return res.status(400).render('register', {
        title: 'Register',
        error: errors.join('. '),
        username,
        email
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      let errorMessage = 'Username or email already exists';
      
      // Provide more specific error message
      if (existingUser.username === username) {
        errorMessage = 'Username is already taken';
      } else if (existingUser.email === email) {
        errorMessage = 'Email is already registered';
      }
      
      return res.status(400).render('register', {
        title: 'Register',
        error: errorMessage,
        username: existingUser.username === username ? '' : username,
        email: existingUser.email === email ? '' : email
      });
    }
    
    // Create new user
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });
    
    await user.save();
    
    // Log registration for admin monitoring
    console.log(`New user registered: ${username} (${email})`);
        
    // Log user in automatically after registration
    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in after registration:', err);
        return res.redirect('/login');
      }
      
      // Set success message in session
      req.session.successMessage = 'Welcome! Your account has been created successfully.';
      
      res.redirect('/');
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    let errorMessage = 'Error creating account';
    
    if (error.code === 11000) {
      errorMessage = 'Username or email already exists';
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Please check your input and try again';
    }
    
    res.status(500).render('register', {
      title: 'Register',
      error: errorMessage
    });
  }
};

// const fetchAll = async () => {
//   const items = await db.collection.find({}).toArray();
//   return items.map(item => item.data);
// };

exports.showLogin = (req, res) => {
res.render("login", { title: "Login" });
};

// Login user
exports.login = (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).render('login', {
      title: 'Login',
      error: 'Username and password are required'
    });
  }
  
passport.authenticate('local', (err, user, info) => {
  if (err) {
    console.error(err);
    return next(err);
  }
    
  if (!user) {
    return res.status(401).render('login', {
		title: 'Login',
		error: info.message || "Invalid credentials"
  });
    }
    
  req.login(user, (err) => {
  if (err) {
        console.error(err);
        return next(err);
	}
      
	// Redirect to admin if user is admin, otherwise home
    const redirectTo = user.isAdmin ? "/admin" : "/";
    res.redirect(redirectTo);
  });
})(req, res, next);
};

// Logout user
exports.logout = (req, res) => {
req.logout((err) => {
    if (err) {
  console.error(err);
  }
   res.redirect('/');
});
};
