const CartItem = require("../models/cart-item");
const DeliveryAddress = require("../models/delivery-address");
const Order = require("../models/order");
const { Types } = require("mongoose");
const Orderitem = require("../models/order-item");

// const store = async (req, res, next) => {
//   const { delivery_fee, delivery_address } = req.body;
//   try {
//     const items = await CartItem.find({ user: req.user._id }).populate(
//       "product"
//     );
//     if (!items) {
//       return res.status(404).json({
//         error: 1,
//         message: "Cart is empty",
//       });
//     }
//     const address = await DeliveryAddress.findById(delivery_address);
//     const order = new Order({
//       _id: new Types.ObjectId(),
//       status: "waiting_payment",
//       delivery_fee,
//       delivery_address: {
//         provinsi: address.provinsi,
//         kota: address.kota,
//         kecamatan: address.kecamatan,
//         kelurahan: address.kelurahan,
//         detail: address.detail,
//       },
//       user: req.user._id,
//     });
//     const orderItem = await Orderitem.insertMany(
//       items.map((item) => ({
//         ...item,
//         name: item.product.name,
//         qty: parseInt(item.qty),
//         price: parseInt(item.product.price),
//         order: order._id,
//         product: item.product._id,
//       }))
//     );
//     orderItem.forEach((item) => order.order_items.push(item));
//     order.save();
//     await CartItem.deleteMany({ user: req.user._id });
//     return res.status(200).json(order);
//   } catch (err) {
//     if (err && err.name === "ValidationError") {
//       return res.status(500).json({
//         error: 1,
//         message: err?.message,
//         fields: err?.errors,
//       });
//     }
//     next(err);
//   }
// };

// const index = async (req, res, next) => {
//   const { skip = 0, limit = 10 } = req.query;
//   try {
//     const count = await Order.find({ user: req.user._id }).countDocuments();
//     const orders = await Order.find({ user: req.user._id })
//       .skip(parseInt(skip))
//       .limit(parseInt(limit))
//       .populate("order_items")
//       .sort("-createdAt");
//     return res.status(200).json({
//       data: orders.map((order) => order.toJSON({ virtuals: true })),
//       count,
//     });
//   } catch (err) {
//     if (err && err.name === "ValidationError") {
//       return res.status(500).json({
//         error: 1,
//         message: err?.message,
//         fields: err?.errors,
//       });
//     }
//     next(err);
//   }
// };

const store = async (req, res, next) => {
  try {
    const { delivery_fee, delivery_address, cart } = req.body;
    console.log("Received request body:", req.body);
    console.log("Received cart data:", req.body.cart);

    const address = await DeliveryAddress.findById(delivery_address);

    const order = new Order({
      status: "waiting_payment",
      delivery_fee,
      delivery_address: {
        kelurahan: address.kelurahan,
        kecamatan: address.kecamatan,
        kota: address.kota,
        provinsi: address.provinsi,
        detail: address.detail,
      },
      user: req.user._id,
      cart: cart,
    });

    await order.save();

    res.status(201).json({ message: "Success Create Order", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
    next(error);
  }
};
const index = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).exec();

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Internal Server Error" });
    next(err);
  }
};
const indexById = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return res.status(404).json({ message: `Order id ${orderId} not found` });
    }

    res.status(200).json({ message: `Order ID ${orderId} found`, order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
    next(error);
  }
};

module.exports = { store, index, indexById };
