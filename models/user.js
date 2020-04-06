const getDb = require("../util/database").getDb;
var ObjectId = require("mongodb").ObjectID;
const Product = require("./product");

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id ? new ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const db = getDb();

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
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  deleteFromCart(productId) {
    const db = getDb();

    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === productId;
    });

    let updatedCartItems = [...this.cart.items];
    let currentQuantity = this.cart.items[cartProductIndex].quantity;

    if (cartProductIndex <= 0) {
      return;
    }

    if (currentQuantity > 1) {
      updatedCartItems = updatedCartItems.map((cp) => {
        return {
          ...cp,
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

    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  async getCart() {
    const products = await Product.fetchByIds(
      this.cart.items.map((item) => item.productId)
    );

    return products.map((product) => {
      return {
        ...product,
        quantity: this.cart.items.find((i) => {
          return i.productId.toString() === product._id.toString();
        }).quantity,
      };
    });
  }

  static fetchById(id) {
    const db = getDb();
    return db.collection("users").findOne(new ObjectId(id));
  }
}

module.exports = User;
