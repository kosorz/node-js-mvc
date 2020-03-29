const fs = require('fs');
const path = require('path');

const Cart = require('./cart')

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

const saveData = (data, cb) => {
  fs.writeFile(p, JSON.stringify(data), cb);
}

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save(cb) {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(prod => prod.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        saveData(updatedProducts, (err) => {
          console.log(err)
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        saveData(products, (err) => {
          if (!err) {
            cb();
          }
        });
      }
    });
  }

  static deleteById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id)
      const updatedProducts = products.filter(prod => prod.id !== id);
      saveData(updatedProducts, (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price, true , cb);
        }
      });
    })
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    const findOne = (products) => {
      return cb(products.find(prod => prod.id === id))
    }

    getProductsFromFile(findOne)
  }
};
