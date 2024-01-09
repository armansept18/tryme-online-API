const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const invoiceSchema = Schema(
  {
    sub_total: {
      type: Number,
      required: true,
    },
    delivery_fee: {
      type: Number,
      required: true,
    },
    delivery_address: {
      provinsi: { type: String, required: true },
      kota: { type: String, required: true },
      kecamatan: { type: String, required: true },
      kelurahan: { type: String, required: true },
      detail: { type: String },
    },
    total: {
      type: Number,
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["waiting_payment", "paid"],
      default: "waiting_payment",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);

module.exports = model("Invoice", invoiceSchema);
