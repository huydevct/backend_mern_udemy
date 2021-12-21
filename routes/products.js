const express = require("express");
const { Product } = require("../models/product");
const router = express.Router();

router.get(`/`, async (req, res, next) => {
  const products = await Product.find();
  if (!products) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(products);
});

router.post(`/count`, (req, res, next) => {
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });
  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

module.exports = router;
