const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
   } else if (username.length < 3 || username.length > 20) {
    errors.push("Username must be between 3 and 20 characters");
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
        errors.push("Username must contain only letters and numbers");
    }

   if (!email || email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
    }

    if (!password || password.length === 0) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

    if (errors.length > 0) {
    return res.status(400).render("register", { 
      title: 'Register',
      error: errors.join('. '), 
      username, 
      email 
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
    const { username, password } = req.body;
    const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push("Username or email is required");
  }

    if (!password || password.length === 0) {
        errors.push("Password is required");
    }

  if (errors.length > 0) {
    return res.status(400).render('login', { errors, username });
  }

    next();
};

const validatePost = (req, res, next) => {
  const { title, content } = req.body;
  const errors = [];

    if (!title || title.trim().length === 0) {
        errors.push('Title is required');
    } else if (title.length < 5 || title.length > 200) {
    errors.push("Title must be between 5 and 200 characters");
  }

  if (!content || content.trim().length === 0) {
    errors.push("Content is required");
    } else if (content.length < 50) {
        errors.push("Content must be at least 50 characters long");
    }

  if (errors.length > 0) {
    req.validationErrors = errors;
    return res.status(400).json({ errors });
  }

    next();
};

const validateComment = (req, res, next) => {
  const { content } = req.body;
  const errors = [];

    if (!content || content.trim().length === 0) {
        errors.push("Comment content is required");
  } else if (content.length < 5) {
    errors.push('Comment must be at least 5 characters long');
  } else if (content.length > 500) {
    errors.push('Comment must not exceed 500 characters');
  }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
  }

  next();
};

const validateContact = (req, res, next) => {
    const { name, email, message } = req.body;
    const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  } else if (name.length < 2 || name.length > 50) {
         errors.push("Name must be between 2 and 50 characters");
    }

    if (!email || email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
     errors.push("Please provide a valid email address");
  }

    if (!message || message.trim().length === 0) {
        errors.push('Message is required');
  } else if (message.length < 10) {
     errors.push('Message must be at least 10 characters long');
  } else if (message.length > 1000) {
    errors.push("Message must not exceed 1000 characters");
  }

    if (errors.length > 0) {
        return res.status(400).render("contact", { errors, name, email, message });
  }

  next();
};

module.exports = {
    validateRegistration,
    validateLogin,
  validatePost,
  validateComment,
  validateContact
};
