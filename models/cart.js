const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
  );

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0}

            if (!err) {
                cart = JSON.parse(fileContent)
            }

            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];

            let updatedProduct;
            if (existingProduct) {
                updatedProduct = {...existingProduct, qty: existingProduct.qty + 1 };
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            
            cart.totalPrice = cart.totalPrice + +productPrice
            
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            })
        })
    }

    static deleteProduct(id, productPrice, deleteAll, cb) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return;
            }
            const cart = JSON.parse(fileContent);
            const updatedCart = { ...cart };

            const product = updatedCart.products.find(prod => prod.id === id);

            if (!product) {
                cb();
                return;
            }

            const productQty = product.qty;

            if (deleteAll) {
                updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
                updatedCart.totalPrice = updatedCart.totalPrice - (productPrice * productQty);
            } else {
                if (productQty === 1) {
                    updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
                } else {
                    updatedCart.products.forEach(prod => {
                        if (prod.id === id) {
                            prod.qty = +prod.qty - 1;
                        }
                    });
                }
                updatedCart.totalPrice = updatedCart.totalPrice - productPrice;

            }
            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                if (!err) {
                    cb();
                } else {
                    console.log(err);
                }
            })
        });
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                console.log(err);
                cb({ products: [], totalPrice: 0 })
            } else {
                cb(JSON.parse(fileContent));
            }
        })
    }
}