const getDb = require("../util/database").getDb;
var ObjectId = require("mongodb").ObjectID;

class Product {
  constructor(title, price, imageUrl, description, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id;
  }

  save() {
    const db = getDb();
    let dbOp;

    if (this._id) {
      dbOp = db
      .collection("products")
      .updateOne({ _id: new ObjectId(this._id) }, { $set: {
        title: this.title,
        price: this.price,
        imageUrl: this.imageUrl,
        description: this.description,
      } });
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

  static deleteById(id) {
    const db = getDb();
    return db
      .collection("products")
      .findOneAndDelete({ _id: new ObjectId(id) });
  }
}

module.exports = Product;
