const path = require("path");
const fs = require("fs");
const moment = require("moment");
const config = require("../utils/config");
const Product = require("../models/product");
const Category = require("../models/category");
const Tag = require("../models/tag");

const store = async (req, res, next) => {
  try {
    let payload = req.body;

    if (payload.name) {
      let existingProduct = await Product.findOne({
        name: { $regex: payload.name, $options: "i" },
      });

      if (existingProduct) {
        return res.status(409).json({
          error: 1,
          message: "Product with the same name already exists!",
        });
      }
    }

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }
    if (payload.tags && payload.tags.length > 0) {
      let tags = await Tag.find({
        name: { $in: payload.tags },
      });
      if (tags.length > 0) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      } else {
        delete payload.tags;
      }
    }
    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      let filename =
        `new-product_${moment().format("YYYYMMDDHHmm")}` + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = new Product({ ...payload, image_url: filename });
          await product.save();
          return res.status(200).json(product);
        } catch (err) {
          fs.unlinkSync(target_path);
          if (err && err.name === "ValidationError") {
            return res.status(500).json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }
          next(err);
        }
      });

      src.on("error", async () => {
        fs.unlinkSync(target_path);
        next(err);
      });
    } else {
      let product = new Product(payload);
      await product.save();
      return res.status(200).json(product);
    }
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(500).json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    let payload = req.body;
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: `Product with ID ${id} not found!`,
      });
    }

    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }
    if (payload.tags && payload.tags.length > 0) {
      let tags = await Tag.find({
        name: { $in: payload.tags },
      });
      if (tags.length > 0) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
        // payload.tags = tags.map((tag) => tag._id);
      } else {
        delete payload.tags;
        // payload.tags = [];
      }
    } else {
      payload.tags = [];
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      let filename =
        `new-product_${moment().format("YYYYMMDDHHmm")}` + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = await Product.findById(id);
          let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;

          if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
          }
          product = await Product.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
          });
          return res.status(200).json(product);
        } catch (err) {
          fs.unlinkSync(target_path);
          if (err && err.name === "ValidationError") {
            return res.status(500).json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }
          next(err);
        }
      });

      src.on("error", async () => {
        next(err);
      });
    } else {
      const product = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
      return res.status(200).json(product);
    }
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.status(500).json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const index = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 5,
      search = "",
      category = "",
      tags = "",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let criteria = {};
    if (search.length) {
      criteria = {
        ...criteria,
        name: { $regex: new RegExp(search, "i") },
      };
    }
    if (category.length) {
      let categoryResult = await Category.findOne({
        name: { $regex: new RegExp(category, "i") },
      });
      if (categoryResult) {
        criteria = { ...criteria, category: categoryResult._id };
      }
    }
    if (tags.length) {
      let tagsResult = await Tag.find({ name: { $in: tags } });
      if (tagsResult.length > 0) {
        criteria = {
          ...criteria,
          tags: { $in: tagsResult.map((tag) => tag._id) },
        };
      }
    }

    // const count = await Product.find().countDocuments(criteria);
    const count = await Product.countDocuments(criteria);

    const totalPages = Math.ceil(count / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));

    const product = await Product.find(criteria)
      // .skip(parseInt(page))
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * limit)
      .limit(limit)
      .populate("category")
      .populate("tags");
    return res
      .status(200)
      .json({ data: product, count, totalPages, currentPage });
  } catch (err) {
    next(err);
  }
};

const indexId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ message: `Product with id ${id} not found!` });
    }
    res.status(200).json({ message: `Product Found`, product });
  } catch (err) {
    res.status(500).json({ message: `Wrong ID!`, error: err?.message });
    next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id });
    const currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    return res.status(200).json({ product, message: `Product Deleted!` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  store,
  index,
  indexId,
  update,
  destroy,
};
