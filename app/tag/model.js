const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const tagSchema = Schema({
  name: {
    type: String,
    minlength: [3, "Min. 3 Characters"],
    maxlength: [20, "Max. 20 Characters"],
    required: [true, "Tag Name is Required"],
  },
});

module.exports = model("Tag", tagSchema);
