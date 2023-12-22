const Product = require("../models/product");
const CartItem = require("../models/cart-item");

const update = async (req, res, next) => {
  const { items } = req.body;
  try {
    const productIds = items.map((item) => item.product._id);
    const products = await Product.find({ _id: { $in: productIds } });
    const cartItems = items.map((item) => {
      const relatedProduct = products.find(
        (product) => product._id.toString() === item.product._id
      );
      return {
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty,
      };
    });
    await CartItem.deleteMany({ user: req.user._id });
    await CartItem.bulkWrite(
      cartItems.map((item) => {
        return {
          updateOne: {
            filter: {
              user: req.user._id,
              product: item.product,
            },
            update: item,
            upsert: true,
          },
        };
      })
    );
    return res.status(200).json(cartItems);
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(500).json({
        error: 1,
        message: err?.message,
        field: err?.errors,
      });
    }
    next(err);
  }
};

const index = async (req, res, next) => {
  try {
    const items = await CartItem.find({ user: req.user._id }).populate(
      "product"
    );
    return res.status(200).json(items);
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(500).json({
        error: 1,
        message: err?.message,
        field: err?.errors,
      });
    }
    next(err);
  }
};
module.exports = {
  update,
  index,
};
