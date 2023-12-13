const User = require("../user/model");
const bcrypt = require("bcrypt");

const register = async (req, res, next) => {
  try {
    const payload = req.body;
    const lastUser = await User.findOne({}, {}, { sort: { customer_id: -1 } });
    const nextCustomerId = lastUser ? lastUser.customer_id + 1 : 1;
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      return res.status(409).json({
        error: 1,
        message: "Email Already Registered!",
        fields: { email: "Already Registered!" },
      });
    }
    const users = new User({
      ...payload,
      customer_id: nextCustomerId,
      password: await bcrypt.hash(payload.password, 10),
    });
    // users.password = await bcrypt.hash(payload.password, 10);
    await users.save();
    return res
      .status(200)
      .json({ message: "User Register Succesfully", users });
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

module.exports = {
  register,
};
