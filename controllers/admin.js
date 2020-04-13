const Product = require("../models/product");
const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: req.flash("error")[0],
    values: { price: null, description: "", imageUrl: "", title: "" },
    validationErrors: [],
  });
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  const productId = req.params.productId;

  if (!editMode) {
    return res.redirect("/");
  }

  try {
    const product = await Product.findById(productId);
    const { price, description, imageUrl, title, _id } = product;
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      errorMessage: req.flash("error")[0],
      values: { price, description, imageUrl, title, _id },
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array()[0].msg,
      values: { price, description, imageUrl, title },
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title,
    price,
    imageUrl,
    description,
    userId: req.user,
  });

  try {
    const saved = await product.save();
    saved && res.redirect("/");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { title, imageUrl, description, price, productId } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      errorMessage: errors.array()[0].msg,
      values: { price, description, imageUrl, title, _id: productId },
      validationErrors: errors.array(),
    });
  }

  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (req.user._id.toString() !== product.userId.toString()) {
    return res.redirect("/");
  }

  product.title = title;
  product.imageUrl = imageUrl;
  product.price = price;
  product.description = description;

  let productSaved;
  try {
    productSaved = await product.save();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  return productSaved && res.redirect("/admin/products");
};

exports.postDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;

  try {
    const removed = await Product.deleteOne({
      _id: productId,
      userId: req.user._id,
    });
    removed && res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
