const getDb = require("../util/database").getDb;
var ObjectId = require("mongodb").ObjectID;

class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDb();
    return db.collection("products").insertOne(this);
  }

  static fetchAll() {
    const db = getDb();
    return db.collection("products").find().toArray();
  }

  static fetchById(id) {
    const db = getDb();
    return db.collection("products").findOne(new ObjectId(id));
  }

  static update(id, data) {
    const db = getDb();
    return db
      .collection("products")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: data });
  }

  static deleteById(id) {
    const db = getDb();
    return db
      .collection("products")
      .findOneAndDelete({ _id: new ObjectId(id)});
  }
}

module.exports = Product;
