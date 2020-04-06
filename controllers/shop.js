const Product = require("../models/product");

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;

  try {
    const product = await Product.fetchById(prodId);

    res.render("shop/product-detail", {
      pageTitle: product.title + " Details",
      path: "/products",
      product: product,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {

  try {
    const cart = await req.user.getCart();

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your cart",
      products: cart,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  // req.user
  //   .getOrders({ include: ["products"] })
  //   .then((orders) => {
  //     res.render("shop/orders", {
  //       path: "/orders",
  //       pageTitle: "Your Orders",
  //       orders: orders,
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  // res.render("shop/checkout", {
  //   path: "/checkout",
  //   pageTitle: "Checkout",
  // });
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    const product = await Product.fetchById(prodId);
    const addedToCart = await req.user.addToCart(product);
    addedToCart && res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    const productDeleted = await req.user.deleteFromCart(prodId)

    productDeleted && res.redirect("/cart");
  } catch(err) {
    console.log(err)
  }
};

exports.postOrder = async (req, res, next) => {
  // const cart = await req.user.getCart();
  // const products = await cart.getProducts();
  // const order = await req.user.createOrder();
  // order.addProducts(
  //   products.map((prod) => {
  //     prod.orderItem = { qty: prod.cartItem.qty };
  //     return prod;
  //   })
  // );
  // await cart.setProducts(null);
  // res.redirect("/orders");
};
