const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

const app = express();

app.use(cors());
app.options("*", cors());

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);

const api = process.env.API_URL;

const productsRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");

// Routers
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/orders`, orderRoutes);

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB is ready!");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
