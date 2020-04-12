const express = require("express");

const authController = require("../controllers/auth");
const authValidations = require("../util/validations/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.get("/reset", authController.getReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/logout", authController.postLogout);

router.post("/signup", authValidations.signup, authController.postSignup);

router.post("/login", authValidations.login, authController.postLogin);

router.post("/reset", authValidations.reset, authController.postReset);

router.post(
  "/new-password",
  authValidations.newPassword,
  authController.postNewPassword
);

module.exports = router;
