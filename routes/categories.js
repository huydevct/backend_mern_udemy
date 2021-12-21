const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();

router.get(`/`, async (req, res, next) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(201).json(categoryList);
});

router.post(`/`, async (req, res, next) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category) {
    return res.status(404).send("the category cannot created");
  }
  res.status(200).send(category);
});

router.get("/:id", async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res
      .status(500)
      .json({ message: "The category with given ID was not found!" });
  }
  res.status(200).send(category);
});

router.put("/:id", async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    {
      new: true,
    }
  );
  if (!category) {
    return res.status(404).send("the category cannot created");
  }
  res.status(200).send(category);
});

router.delete("/:id", async (req, res, next) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "The category is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "category not found!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
