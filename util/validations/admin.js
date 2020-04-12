const { body } = require("express-validator");

const titlePresentValidation = body("title")
  .notEmpty()
  .withMessage("Title must be provided")
  .trim();

const descriptionPresentValidation = body("description")
  .notEmpty()
  .withMessage("Description must be provided")
  .trim(" ");

const imageUrlPresentValidation = body("imageUrl")
  .notEmpty()
  .withMessage("Image URL must be provided")
  .isURL()
  .withMessage("Invalid URL format")
  .trim();

const pricePresentValidation = body("price")
  .notEmpty()
  .withMessage("Price must be provided")
  .trim();

const productValidation = [
  titlePresentValidation,
  imageUrlPresentValidation,
  pricePresentValidation,
  descriptionPresentValidation,
];

exports.editProduct = productValidation;
exports.addProduct = productValidation;
