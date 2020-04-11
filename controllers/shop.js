const Product = require("../models/product");

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;

  try {
    const product = await Product.findById(prodId);

    res.render("shop/product-detail", {
      pageTitle: product.title + " Details",
      path: "/products",
      product: product,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const userWithCart = await req.user
      .populate("cart.items.productId")
      .execPopulate();

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your cart",
      products: userWithCart.cart.items,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders();
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    const product = await Product.findById(prodId);
    const addedToCart = await req.user.addToCart(product);
    addedToCart && res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    const productDeleted = await req.user.deleteFromCart(prodId);

    productDeleted && res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.postOrder = async (req, res, next) => {
  const orderAdded = await req.user.addOrder();
  orderAdded && res.redirect("/");
};
