function ensureAuth(req, res, next) {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login');
  }
  
  function ensureAdmin(req, res, next) {
    if (req.session.user && req.session.user.is_admin) {
      return next();
    }
    res.send('Access denied');
  }
  
  module.exports = { ensureAuth, ensureAdmin };
  