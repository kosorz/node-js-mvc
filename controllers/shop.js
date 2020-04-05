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

exports.getCart = (req, res, next) => {
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     return cart.getProducts();
  //   })
  //   .then((products) => {
  //     res.render("shop/cart", {
  //       path: "/cart",
  //       pageTitle: "Your cart",
  //       products: products,
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  // const prodId = req.body.productId;
  // let fetchedCart;

  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((products) => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       product.cartItem.qty += 1;
  //       return product.cartItem.save();
  //     }

  //     return Product.findByPk(prodId)
  //       .then((product) => {
  //         return fetchedCart.addProduct(product, {
  //           through: { qty: 1 },
  //         });
  //       })
  //       .catch((err) => console.log(err));
  //   })
  //   .then(() => {
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  // const prodId = req.body.productId;
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     cart
  //       .getProducts({ where: { id: prodId } })
  //       .then((products) => {
  //         const product = products[0];
  //         if (product.cartItem.qty > 1) {
  //           product.cartItem.qty -= 1;
  //           return product.cartItem.save();
  //         }

  //         return product.cartItem.destroy();
  //       })
  //       .then(() => {
  //         res.redirect("/cart");
  //       })
  //       .catch();
  //   })
  //   .catch((err) => console.log(err));
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
