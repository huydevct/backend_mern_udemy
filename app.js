const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

const app = express();

// middleware
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));

const api = process.env.API_URL;
const productsRouter = require("./routes/products");
const categoryRouter = require("./routes/categories");

// Routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoryRouter);

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
