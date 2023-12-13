const Tags = require("./model");

const store = async (req, res, next) => {
  try {
    const payload = req.body;
    const tag = new Tags(payload);
    await tag.save();
    return res.status(200).json(tag);
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

const update = async (req, res, next) => {
  const { id } = req.params;
  try {
    const payload = req.body;
    const existingTag = await Tags.findById(id);
    if (!existingTag) {
      return res.status(404).json({
        message: `Tag id ${id} not found!`,
      });
    }
    const tag = await Tags.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json(tag);
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
    const existingTag = await Tags.findById(id);
    if (!existingTag) {
      return res.status(404).json({
        message: `Tag id ${id} not found!`,
      });
    }
    const tag = await Tags.findByIdAndDelete(req.params.id);
    return res.status(200).json(tag);
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
  try {
    const tag = await Tags.find();
    return res.status(200).json(tag);
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

const indexById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const tag = await Tags.findById(id);
    if (!tag) {
      return res.status(404).json({ message: `Tag with id ${id} not found!` });
    }
    res.status(200).json({ message: "Tag Found", tag });
  } catch (err) {
    res.status(500).json({ message: "Wrong ID!", error: err?.message });
    next(err);
  }
};

module.exports = {
  store,
  update,
  index,
  destroy,
  indexById,
};
