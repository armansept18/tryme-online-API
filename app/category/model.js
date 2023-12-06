const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const categorySchema = Schema({
  name: {
    type: String,
    minlength: [3, `Min. 3 Characters!`],
    maxlength: [20, `Max. 20 Characters!`],
    required: [true, `Nedd Fill Category`],
  },
});

module.exports = model("Category", categorySchema);
