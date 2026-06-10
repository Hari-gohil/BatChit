const router = require("express").Router();
const {
    getUsers,
    searchUsers,
    getMyProfile,
    getUserById,
    updateProfile,
    deleteUser
} = require('../controllers/userController');
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getUsers);

router.get("/search", searchUsers);

router.get("/profile/me",
  authMiddleware,
  getMyProfile
);

router.get("/:id", getUserById);

router.put(
  "/profile/update",
  authMiddleware,
  updateProfile
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

module.exports = router;