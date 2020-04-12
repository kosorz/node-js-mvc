const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error")[0],
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error")[0],
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
    req.flash("error", "Invalid email or password");
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
    req.flash("error", "Invalid email or password");
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
    req.flash("error", "Passwords do not match");
    return res.redirect("/signup");
  }

  let emailUsed;
  try {
    emailUsed = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
  }

  if (emailUsed) {
    req.flash("error", "Email already used");
    return res.redirect("/signup");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email: email,
    password: hashedPassword,
    cart: { items: [] },
  });

  const savedUser = await user.save();

  let emailSent;
  try {
    emailSent = await transporter.sendMail({
      to: email,
      from: "welcome@node-training",
      subject: "Signup succeeded!",
      html: "<h1>Welcome to node training!</h1>",
    });
  } catch (err) {
    console.log(err);
  }

  return savedUser && emailSent && res.redirect("/login");
};
