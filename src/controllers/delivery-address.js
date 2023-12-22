const { subject } = require("@casl/ability");
const { policyFor } = require("../utils/index");
const DeliveryAddress = require("../models/delivery-address");

const store = async (req, res, next) => {
  try {
    const payload = req.body;
    const user = req.user;
    const address = new DeliveryAddress({ ...payload, user: user._id });
    await address.save();
    return res.status(200).json({
      message: "Added successfully!",
      address,
    });
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(500).json({
        error: 1,
        message: err?.message,
        fields: err?.message,
      });
    }
    next(err);
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  let address = await DeliveryAddress.findById(id);
  const { _id, ...payload } = req.body;
  const policy = policyFor(req.user);
  try {
    if (!address) {
      return res.status(404).json({
        message: `Address id ${id} not found!`,
      });
    }
    let subjectAddress = subject("DeliveryAddress", {
      ...address,
      user_id: address.user,
    });
    if (!policy.can("update", subjectAddress)) {
      return res.status(401).json({
        error: 1,
        message: "Unauthorized User!",
      });
    }
    address = await DeliveryAddress.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ message: `Edited Successfully!`, address });
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(500).json({
        error: 1,
        message: err?.message,
        fields: err?.errors,
      });
    }
    next(err);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req.params;
  let address = await DeliveryAddress.findById(id);
  const policy = policyFor(req.user);
  try {
    if (!existingAddress) {
      return res.status(404).json({
        message: `Address id ${id} not found!`,
      });
    }
    const subjectAddress = subject("DeliveryAddress", {
      ...address,
      user_id: address.user,
    });
    if (!policy.can("delete", subjectAddress)) {
      return res.status(401).json({
        error: 1,
        message: "You are not authorized to delete this Address.",
      });
    }
    address = await DeliveryAddress.findByIdAndDelete(id);
    return res.status(200).json({ message: "Deleted successfully!" });
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(500).json({
        error: 1,
        message: err?.message,
        fields: err?.errors,
      });
    }
    next(err);
  }
};

const index = async (req, res, next) => {
  let { skip = 0, limit = 10 } = req.query;
  try {
    const count = await DeliveryAddress.find({
      user: req.user._id,
    }).countDocuments();
    const address = await DeliveryAddress.find({
      user: req.user._id,
    })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort("-createdAt");
    return res.status(200).json({ data: address, count });
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

const indexId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const address = await DeliveryAddress.findById(id);
    if (!address) {
      return res.status(404).json({
        message: `Address id ${id} not found!`,
      });
    }
    return res.status(200).json(address);
  } catch (err) {
    return res.status(500).json({ message: "Wrong ID!", error: err?.message });
    next(err);
  }
};

module.exports = {
  store,
  index,
  update,
  destroy,
  indexId,
};
