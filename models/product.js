const fs = require('fs');
const path = require('path');

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

const saveData = (data) => {
  fs.writeFile(p, JSON.stringify(data), err => {
    console.log(err);
  });
}

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(prod => prod.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        saveData(updatedProducts);
      } else {
        this.id = Math.random().toString();
        products.push(this);
        saveData(products);
      }
    });
  }

  delete() {
    getProductsFromFile(products => {
      const existingProductIndex = products.findIndex(prod => prod.id === this.id);
      const updatedProducts = [...products];
      updatedProducts.splice(existingProductIndex, 1);
      saveData(updatedProducts);
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
