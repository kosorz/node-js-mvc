const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");

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

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: req.flash("error")[0],
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
    console.log(err);
  }

  user &&
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: req.flash("error")[0],
      userId: user._id.toString(),
      passwordToken: token,
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

exports.postReset = (req, res, next) => {
  const { email } = req.body;

  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    let user;
    try {
      user = await User.findOne({ email, email });
    } catch (err) {
      console.log(err);
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
        console.log(err);
      }
    }

    return emailSent && res.redirect("/");
  });
};

exports.postNewPassword = async (req, res, next) => {
  const { password, userId, passwordToken } = req.body;

  let user;
  try {
    user = await User.findOne({
      _id: userId,
      resetTokenExpiration: { $gt: new Date() },
      resetToken: passwordToken,
    });
  } catch (err) {
    console.log(err);
  }

  if (!user) {
    res.redirect("/");
  }

  let hashedNewPassword;
  try {
    hashedNewPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
  }

  user.password = hashedNewPassword;
  user.resetToken = null;
  user.resetTokenExpiration = null;

  let userSaved;
  try {
    userSaved = await user.save();
  } catch (err) {
    console.log(err);
  }

  return userSaved && res.redirect("/login");
};
