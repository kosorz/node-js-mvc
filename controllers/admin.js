const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("userId");
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
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
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;

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
    console.log(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { title, imageUrl, description, price, productId } = req.body;

  try {
    const product = await Product.findById(productId);
    product.title = title;
    product.imageUrl = imageUrl;
    product.price = price;
    product.description = description;
    const saved = product.save();
    saved && res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;

  try {
    const removed = await Product.findByIdAndRemove(productId);
    removed && res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};
