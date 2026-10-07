exports.showLogin = (req, res) => {
  res.render("login", {
    error: null,
    username: "",
    title: "digiLATERAL · Sign in",
  });
};

exports.handleLogin = (req, res) => {
  const { username, password } = req.body;

  console.log("fdsfffffffffffffffffffffffffffffff",username, password)

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter both a username and password.",
    });
  }

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (
    username !== validUsername ||
    password !== validPassword
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password.",
    });
  }

  req.session.loggedIn = true;
  req.session.username = username;

  return res.json({
    success: true,
    username,
  });
};

exports.handleLogout = (req, res) => {
  req.session.destroy(() => {
    res.json({
      success: true,
    });
  });
};