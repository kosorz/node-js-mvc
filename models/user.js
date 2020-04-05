const getDb = require("../util/database").getDb;
var ObjectId = require("mongodb").ObjectID;

class User {
  constructor(username, email) {
    this.name = username;
    this.email = email;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  static fetchById(id) {
    const db = getDb();
    return db.collection("users").findOne(new ObjectId(id));
  }
}

module.exports = User;
