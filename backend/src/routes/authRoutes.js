const router = require("express").Router();

const {
  register,
  login,
  getMe,
  changePassword,
  updateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", register);

router.post("/login", login);

router.get(
  "/me",
  authMiddleware,
  getMe
);

router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePic"),
  updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;