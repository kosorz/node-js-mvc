const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

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
    values: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error")[0],
    values: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: req.flash("error")[0],
    values: { email: "" },
    validationErrors: [],
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;

  let user;
  try {
    user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  user &&
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: req.flash("error")[0],
      userId: user._id.toString(),
      passwordToken: token,
      values: { password: "" },
      validationErrors: [],
    });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      values: { email, password },
      validationErrors: errors.array(),
    });
  }

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (!user) {
    req.flash("error", "Invalid email or password");
    return res.redirect("/login");
  }

  let doMatch;
  try {
    doMatch = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      values: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    email: email,
    password: hashedPassword,
    cart: { items: [] },
  });

  let savedUser;
  try {
    savedUser = await user.save();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  let emailSent;
  try {
    emailSent = await transporter.sendMail({
      to: email,
      from: "welcome@node-training",
      subject: "Signup succeeded!",
      html: "<h1>Welcome to node training!</h1>",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  return savedUser && emailSent && res.redirect("/login");
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/reset", {
      path: "/reset",
      pageTitle: "Reset Password",
      errorMessage: errors.array()[0].msg,
      values: { email: email },
      validationErrors: errors.array(),
    });
  }

  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    let user;
    try {
      user = await User.findOne({ email, email });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }

    if (!user) {
      req.flash("error", "No account with that email found");
      return res.redirect("/reset");
    }

    user.resetTokenExpiration = Date.now() + 3600000;
    user.resetToken = token;

    const userSaved = await user.save();

    let emailSent;
    if (userSaved) {
      try {
        emailSent = await transporter.sendMail({
          to: email,
          from: "reset@node-training",
          subject: "Password reset!",
          html: `
            <p>You've requested password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link<a/> to set a new password</p>
          `,
        });
      } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
    }

    return emailSent && res.redirect("/");
  });
};

exports.postNewPassword = async (req, res, next) => {
  const { password, userId, passwordToken } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: errors.array()[0].msg,
      userId: userId,
      passwordToken: passwordToken,
      values: { password },
      validationErrors: errors.array(),
    });
  }

  let user;
  try {
    user = await User.findOne({
      _id: userId,
      resetTokenExpiration: { $gt: new Date() },
      resetToken: passwordToken,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (!user) {
    res.redirect("/");
  }

  let hashedNewPassword;
  try {
    hashedNewPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  user.password = hashedNewPassword;
  user.resetToken = null;
  user.resetTokenExpiration = null;

  let userSaved;
  try {
    userSaved = await user.save();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  return userSaved && res.redirect("/login");
};
