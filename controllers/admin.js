const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
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

  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    console.log(err);
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
    console.log(err);
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
    console.log(err);
  }
};
