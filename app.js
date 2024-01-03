const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const { decodeToken } = require("./src/middlewares/index");
const productRoute = require("./src/routes/product");
const categoryRoute = require("./src/routes/category");
const tagRoute = require("./src/routes/tag");
const authRoute = require("./src/routes/auth");
const deliveryAddressRoute = require("./src/routes/delivery-address");
const cartRoute = require("./src/routes/cart");
const orderRoute = require("./src/routes/order");
const invoiceRoute = require("./src/routes/invoice");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(decodeToken());

app.use("/auth", authRoute);
app.use("/api", productRoute);
app.use("/api", categoryRoute);
app.use("/api", tagRoute);
app.use("/api", deliveryAddressRoute);
app.use("/api", cartRoute);
app.use("/api", orderRoute);
app.use("/api", invoiceRoute);
app.use("/static", express.static(`${__dirname}/src/public/images/products`));
// Home
app.use("/", function (req, res) {
  res.render("index", {
    title: "Home API Service",
  });
  console.log("Welcome to API Service 🔥");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
