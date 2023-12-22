const { subject } = require(`@casl/ability`);
const Invoice = require("../models/invoice");
const { policyFor } = require("../utils/index");

const show = async (req, res, next) => {
  const { order_id } = req.params;
  const policy = policyFor(req.user);

  try {
    const invoice = await Invoice.findOne({ order: order_id })
      .populate("order")
      .populate("user");
    const subjectInvoice = subject("Invoice", {
      ...invoice,
      user_id: invoice.user._id,
    });
    if (!policy.can("read", subjectInvoice)) {
      return res.status(403).json({
        error: 1,
        message: "You are not authorized to perform this action",
      });
    }
    if (!policy.can("read", "Invoice")) {
      return res.status(403).json({
        error: 1,
        message: `User ${req.user.username} is not allowed to view all invoices.`,
      });
    }
    return res.status(200).json(invoice);
  } catch (err) {
    return res
      .status(500)
      .json({ error: 1, message: err.message || "Internal server error" });
  }
};

module.exports = {
  show,
};
