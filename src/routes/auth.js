const router = require("express").Router();
const authController = require("../controllers/auth");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy({ usernameField: "email" }, authController.localStrategy)
);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/delete/:id", authController.destroy);
router.get("/check", authController.check);
router.get("/check/:id", authController.userIdCheck);

module.exports = router;
