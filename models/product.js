const getDb = require("../util/database").getDb;
var ObjectId = require("mongodb").ObjectID;

class Product {
  constructor(title, price, imageUrl, description, userId, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId;
    this._id = id ? new ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    let dbOp;

    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("products").insertOne(this);
    }

    return dbOp;
  }

  static fetchAll() {
    const db = getDb();
    return db.collection("products").find().toArray();
  }

  static fetchById(id) {
    const db = getDb();
    return db.collection("products").findOne(new ObjectId(id));
  }

  static fetchByIds(ids) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray();
  }

  static deleteById(id) {
    const db = getDb();
    return db.collection("products").deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Product;
