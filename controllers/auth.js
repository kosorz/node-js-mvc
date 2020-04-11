const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }

  if (!user) {
    return res.redirect("/login");
  }

  let doMatch;

  try {
    doMatch = await bcrypt.compare(password, user.password);
  } catch (err) {
    console.log(err);
  }

  if (doMatch) {
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      console.log(err);
      return res.redirect("/");
    });
  } else {
    return res.redirect("/login");
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.redirect("/signup");
  }

  let emailUsed;

  try {
    emailUsed = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }

  if (emailUsed) {
    return res.redirect("/signup");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email: email,
    password: hashedPassword,
    cart: { items: [] },
  });

  const savedUser = await user.save();

  return savedUser && res.redirect("/login");
};
