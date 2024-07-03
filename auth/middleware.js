// Middleware to check if a user is authenticated
function isAuthenticated(req, res, next) {
  if (req.user) {
    console.log('isAuthenticated: passes')
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Middleware to check if a user has admin privileges
function isAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    console.log('isAdmin: passeds')
    return next();
  }
  res.status(401).json({ message: 'Admin Authentication required' });
};
  
module.exports = { isAdmin, isAuthenticated };
