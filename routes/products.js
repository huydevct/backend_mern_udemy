const express = require("express");
const { Category } = require("../models/category");
const { Product } = require("../models/product");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/`, async (req, res, next) => {
  // localhost:3000/app/v1/products?categories=2323,234
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const products = await Product.find(filter).populate("category");
  // const products = await Product.find().select("name image -_id");

  if (!products) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(products);
});

router.get(`/:id`, async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

router.post(`/`, async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category!");
  }

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) {
    return res.status(500).send("The product cannot be saved!");
  }

  res.send(product);
});

router.put("/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.send("Invalid Product Id!");
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category!");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
    }
  );
  if (!product) {
    return res.status(404).send("the product cannot updated");
  }
  res.status(200).send(product);
});

router.delete("/:id", async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.send("Invalid Product Id!");
  }

  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res, next) => {
  const productCount = await Product.countDocuments({ type: "product" });

  if (!productCount) {
    res.status(500).json({ success: false });
  }

  res.send({ productCount });
});

router.get("/get/featured/:count", async (req, res, next) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }

  res.send({ products });
});

module.exports = router;
