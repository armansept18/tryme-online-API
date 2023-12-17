const { police_check } = require("../../middlewares");
const DeliveryAddressController = require("./controller");
const router = require("express").Router();

router.get("/delivery-addresses", DeliveryAddressController.index);
router.get("/delivery-addresses/:id", DeliveryAddressController.indexId);
router.post(
  "/delivery-addresses",
  police_check("create", "DeliveryAddress"),
  DeliveryAddressController.store
);
router.put(
  "/delivery-addresses/:id",
  police_check("update", "DeliveryAddress"),
  DeliveryAddressController.update
);
router.delete(
  "/delivery-addresses/:id",
  police_check("delete", "DeliveryAddress"),
  DeliveryAddressController.destroy
);

module.exports = router;
