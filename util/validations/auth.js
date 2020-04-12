const User = require("../../models/user");
const { body } = require("express-validator");

const emailPresentValidation = body("email")
  .notEmpty()
  .withMessage("Email must be provided")
  .isEmail()
  .withMessage("Invalid email format");

const passwordPresentValidation = body("password")
  .notEmpty()
  .withMessage("Password must be provided");

const newEmailValidation = body("email")
  .notEmpty()
  .withMessage("Email must be provided")
  .isEmail()
  .withMessage("Invalid email format")
  .custom(async (value, { req }) => {
    let emailUsed;
    try {
      emailUsed = await User.findOne({ email: value });
    } catch (err) {
      console.log(err);
    }

    if (emailUsed) {
      throw new Error("Email already used");
    }
  });

const newPasswordValidation = body("password")
  .notEmpty()
  .withMessage("Password must be provided")
  .isLength({ min: 5 })
  .withMessage("Password must contain at least 5 characters")
  .isAlphanumeric()
  .withMessage("Password must consist of letters and digits only");

const confirmPasswordValidation = body("confirmPassword")
  .notEmpty()
  .custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords have to match");

    return true;
  });

exports.login = [emailPresentValidation, passwordPresentValidation];

exports.newPassword = [newPasswordValidation];

exports.reset = [emailPresentValidation];

exports.signup = [
  newEmailValidation,
  newPasswordValidation,
  confirmPasswordValidation,
];
