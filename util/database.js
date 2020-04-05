const montodb = require("mongodb");
const MongoClient = montodb.MongoClient;

let _db;

const mongoConnect = cb => {
  MongoClient.connect(
    "mongodb+srv://Arturito:xXUKZ5SKPt6_gQ9@node-training-7n0n7.mongodb.net/shop?retryWrites=true&w=majority",
    { useUnifiedTopology: true }
  )
    .then(client => {
      _db = client.db();
      cb();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
