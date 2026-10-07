function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
    return res.status(401).json({
    success: false,
    message: "Authentication required",
  });
}

module.exports = { requireLogin };