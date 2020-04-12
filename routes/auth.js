const express = require("express");

const authController = require("../controllers/auth");
const authValidation = require("../util/validations/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.get("/reset", authController.getReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/logout", authController.postLogout);

router.post("/signup", authValidation.signup, authController.postSignup);

router.post("/login", authValidation.login, authController.postLogin);

router.post("/reset", authValidation.reset, authController.postReset);

router.post(
  "/new-password",
  authValidation.newPassword,
  authController.postNewPassword
);

module.exports = router;
