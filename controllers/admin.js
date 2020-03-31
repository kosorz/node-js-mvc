const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect('/');
  }

  const productId = req.params.productId;

  Product.findByPk(productId)
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
  }).catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll().then((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  }).catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;
  Product.create({
    title,
    price,
    imageUrl,
    description,
  }).then(() => {
    res.redirect('/admin/products');
  })
  .catch(err => {
    console.log(err)
  })
};

exports.postEditProduct = (req, res, next) => {
  const { title, imageUrl, description, price, productId } = req.body;
  Product.findByPk(productId)
  .then(product => {
    product.title = title;
    product.imageUrl = imageUrl;
    product.description = description;
    product.price = price;
    return product.save()
  })
  .then(() => {
    res.redirect('/admin/products')
  })
  .catch(err => console.log(err))
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.findByPk(productId)
    .then((product) => {
      return product.destroy();
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
};
