const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const productSchema = Schema(
  {
    name: {
      type: String,
      minlength: [3, "Min. 3 Characters"],
      required: [true, "Field Can't Empty!"],
    },
    description: {
      type: String,
      maxlength: [1000, "Max. 1000 Characters"],
    },
    price: {
      type: Number,
      default: 0,
    },
    image_url: String,
  },
  { timestamps: true }
);
module.exports = model("Product", productSchema);
