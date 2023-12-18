const DeliveryAddress = require("./model");

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
  const existingAddress = await DeliveryAddress.findById(id);
  const payload = req.body;
  try {
    if (!existingAddress) {
      return res.status(404).json({
        message: `Address id ${id} not found!`,
      });
    }
    const address = await DeliveryAddress.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      }
    );
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
  try {
    const existingAddress = await DeliveryAddress.findById(id);
    if (!existingAddress) {
      return res.status(404).json({
        message: `Address id ${id} not found!`,
      });
    }
    const address = await DeliveryAddress.findByIdAndDelete(id);
    return res.status(200).json({ message: "Deleted successfully!" });
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(500).json({
        error: 1,
        message: err?.message,
        fields: err?.errors,
      });
    }
  }
};

const index = async (req, res, next) => {
  try {
    const address = await DeliveryAddress.find();
    return res.status(200).json(address);
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
