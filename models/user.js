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
    let products;
    try {
      products = await Product.fetchByIds(
        this.cart.items.map((item) => item.productId)
      );
    } catch (err) {
      console.log(err);
    }

    return products.map((product) => {
      return {
        ...product,
        quantity: this.cart.items.find((i) => {
          return i.productId.toString() === product._id.toString();
        }).quantity,
      };
    });
  }

  async addOrder() {
    const db = getDb();
    let orderAdded;
    let cart;

    try {
      cart = await this.getCart();
    } catch (err) {
      console.log(err);
    }

    try {
      orderAdded = await db.collection("orders").insertOne({
        items: [...cart],
        user: {
          _id: new ObjectId(this._id),
          name: this.name,
          email: this.email,
        },
      });
    } catch (err) {
      console.log(err);
    }

    return (
      orderAdded &&
      db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(this._id) },
          { $set: { cart: { items: [] } } }
        )
    );
  }

  async getOrders() {
    const db = getDb();

    return await db
    .collection("orders")
    .find({ "user._id": new ObjectId(this._id) })
    .toArray();
  }

  static fetchById(id) {
    const db = getDb();
    return db.collection("users").findOne(new ObjectId(id));
  }
}

module.exports = User;
