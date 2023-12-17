const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const DeliveryAddressSchema = Schema(
  {
    nama: {
      type: String,
      required: true,
      maxlength: 255,
    },
    kelurahan: {
      type: String,
      required: true,
      maxlength: 255,
    },
    kecamatan: {
      type: String,
      required: true,
      maxlength: 255,
    },
    kota: {
      type: String,
      required: true,
      maxlength: 255,
    },
    provinsi: {
      type: String,
      required: true,
      maxlength: 255,
    },
    detail: {
      type: String,
      required: true,
      maxlength: 1024,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = model("DeliveryAddress", DeliveryAddressSchema);
