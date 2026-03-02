// const isAuthenticated = (req, res, next) => {
// 	if (req.isAuthenticated()) {
// 		return next();
//   }
//   res.redirect('/login');
// };

const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
  }
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
	}
  
  if (req.isAuthenticated()) {
    res.redirect('/');
     } else {
        res.redirect('/login');
  }
};

module.exports = {
	isAuthenticated,
 isAdmin
};
