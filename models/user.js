const mongoose = require("mongoose");
const Order = require("./order");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteFromCart = function (productId) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === productId.toString();
  });

  let updatedCartItems = [...this.cart.items];
  let currentQuantity = this.cart.items[cartProductIndex].quantity;

  if (cartProductIndex < 0) {
    return;
  }

  if (currentQuantity > 1) {
    updatedCartItems = updatedCartItems.map((cp) => {
      return {
        ...cp.toObject(),
        quantity:
          cp.productId.toString() === productId.toString()
            ? cp.quantity - 1
            : cp.quantity,
      };
    });
  } else {
    updatedCartItems = updatedCartItems.filter(
      (cp) => cp.productId.toString() !== productId.toString()
    );
  }

  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.addOrder = async function () {
  let orderAdded;
  const order = new Order({ userId: this, items: this.cart.items });

  try {
    orderAdded = order.save();
  } catch (err) {
    console.log(err);
  }

  this.cart.items = [];
  return orderAdded && this.save();
};

userSchema.methods.getOrders = function () {
  return Order.find({ userId: this }).populate("items.productId");
};

module.exports = mongoose.model("User", userSchema);
