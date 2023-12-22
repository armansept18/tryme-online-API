const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const cartItemSchema = Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    default: 0,
  },
  image_url: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
});

module.exports = model("CartItem", cartItemSchema);
