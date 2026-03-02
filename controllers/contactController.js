const Contact = require('../models/Contact');

// Show contact form
exports.show = (req, res) => {
  const success = req.query.success === 'true' 
    ? 'Thank you for your message! We will get back to you soon.' 
    : null;
  res.render('contact', { title: 'Contact Us', success });
};

// Submit contact form
exports.submit = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      isRead: false
    });
    
    await contact.save();
    
    res.redirect('/contact?success=true');
  } catch (error) {
    console.error(error);
    res.status(500).render('contact', {
      title: 'Contact Us',
      error: 'Error sending message. Please try again.'
    });
  }
};
