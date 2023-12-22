const User = require("../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const { getToken } = require("../utils/index");

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

const localStrategy = async (email, password, done) => {
  try {
    const user = await User.findOne({ email }).select(
      "-__v -createdAt -updatedAt -cart_items -token"
    );
    if (!user) {
      return done();
    }
    if (bcrypt.compareSync(password, user.password)) {
      ({ password, ...userWithoutPassword } = user.toJSON());
      return done(null, userWithoutPassword);
    }
  } catch (err) {
    done(err, null);
  }
  done();
};

const login = async (req, res, next) => {
  try {
    passport.authenticate("local", async function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(404)
          .json({ error: 1, message: "Email or Password Incorrect!" });
      }
      await User.findByIdAndUpdate(user._id, { $set: { token: [] } });
      const signIn = jwt.sign(user, config.secretkey, {
        expiresIn: "5min",
      });
      await User.findByIdAndUpdate(user._id, { $push: { token: signIn } });

      res.status(200).json({
        message: "Login Success!",
        user,
        token: signIn,
      });
    })(req, res, next);
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

const logout = async (req, res, next) => {
  const token = getToken(req);
  try {
    if (!token) {
      res.status(401).json({
        error: 1,
        message: `Token is missing request or need login first!`,
      });
    }
    const user = await User.findOne({
      email: req.user.email,
      token: { $in: [token] },
    });
    // const user = await User.findOneAndUpdate(
    //   { token: { $in: [token] } },
    //   { $pull: { token: token } },
    //   { useFindAndModify: false }
    // );
    if (!user) {
      res.status(404).json({
        error: 1,
        message: "User not found or invalid token!",
      });
    }
    await User.findByIdAndUpdate(user._id, { $pull: { token: token } });
    return res.status(200).json({
      error: 0,
      message: "Logout Success!",
    });
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

const check = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error("You're Not Logged in or Token Expired!");
      // res.json({
      //   error: 1,
      //   message: "You're Not Login or Token Expired",
      // });
    }
    res.json(req.user);
  } catch (err) {
    if (!res.headersSent) {
      res.status(401).json({
        message: err?.message || "Authentication Failed",
      });
    }
  }
};

module.exports = {
  register,
  login,
  localStrategy,
  logout,
  check,
};
