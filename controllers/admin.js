const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.getProducts = (req, res, next) => {
  // req.user
  //   .getProducts()
  //   .then(products => {
  //     res.render("admin/products", {
  //       prods: products,
  //       pageTitle: "Admin Products",
  //       path: "/admin/products"
  //     });
  //   })
  //   .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  // const editMode = req.query.edit;
  // const productId = req.params.productId;
  // if (!editMode) {
  //   return res.redirect("/");
  // }
  // req.user
  //   .getProducts({ where: { id: productId } })
  //   .then(products => {
  //     const product = products[0];
  //     res.render("admin/edit-product", {
  //       pageTitle: "Edit Product",
  //       path: "/admin/edit-product",
  //       editing: editMode,
  //       product: product
  //     });
  //   })
  //   .catch(err => console.log(err));
};

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;

  const product = new Product(title, price, description, imageUrl);

  product.save();
};

exports.postEditProduct = (req, res, next) => {
  // const { title, imageUrl, description, price, productId } = req.body;
  // req.user
  //   .getProducts({ where: { id: productId } })
  //   .then(products => {
  //     const product = products[0];
  //     product.title = title;
  //     product.imageUrl = imageUrl;
  //     product.description = description;
  //     product.price = price;
  //     return product.save();
  //   })
  //   .then(() => {
  //     res.redirect("/admin/products");
  //   })
  //   .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  // const { productId } = req.body;
  // req.user
  //   .getProducts({ where: { id: productId } })
  //   .then(products => {
  //     return products[0].destroy();
  //   })
  //   .then(() => res.redirect("/admin/products"))
  //   .catch(err => console.log(err));
};
