const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = Schema(
  {
    full_name: {
      type: String,
      required: [true, "Fill Your Name"],
      maxlength: [255, "Max Character 255"],
      minlength: [3, "Min Character 3"],
    },
    customer_id: {
      type: Number,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Fill Your Email"],
      maxlength: [255, "Max Character 255"],
      unique: true,
      validate: {
        validator: function (value) {
          const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return EMAIL_RE.test(value);
        },
        message: "Email Not Valid",
      },
    },
    password: {
      type: String,
      required: [true, "Enter Password"],
      maxlength: [255, "Max Character 255"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: [String],
  },
  { timestamps: true }
);

// userSchema.path("email").validate(async function (value) {
//   try {
//     const count = await this.count({ email: value });
//     return count === 0;
//   } catch (err) {
//     throw err;
//   }
// }, "Email Already Registered!");

// const HASH_ROUND = 10;
// userSchema.pre("save", function (next) {
//   this.password = bcrypt.hashSync(this.password, HASH_ROUND);
//   next();
// });

// userSchema.plugin(AutoIncrement, {
//   inc_field: "customer_id",
// });

module.exports = model("User", userSchema);
