const express = require("express");
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const router = express.Router();

router.get(`/`, async (req, res, next) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .populate("orderItems")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }

  res.send(orderList);
});

router.get(`/:id`, async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
  // .populate("orderItems");

  if (!order) {
    res.status(500).json({ success: false });
  }

  res.send(order);
});

router.post(`/`, async (req, res, next) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolve = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolve.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolve,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  order = await order.save();

  if (!order) {
    return res.status(400).send("the order cannot created");
  }
  res.status(200).send(order);
});

router.put("/:id", async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  if (!order) {
    return res.status(404).send("the order cannot created");
  }
  res.status(200).send(order);
});

router.delete("/:id", async (req, res, next) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems,
          map(async (orderItem) => {
            await OrderItem.findByIdAndRemove(orderItem);
          });
        return res
          .status(200)
          .json({ success: true, message: "The order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/totalSales", async (req, res, next) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated!");
  }

  res.send({ totalSales: totalSales.pop().totalSales });
});

router.get("/get/count", async (req, res, next) => {
  const ordersCount = await Order.countDocuments({ type: "order" });

  if (!ordersCount) {
    res.status(500).json({ success: false });
  }

  res.send({ ordersCount });
});

router.get(`/get/userorders/:userid`, async (req, res, next) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }

  res.send(userOrderList);
});

module.exports = router;
