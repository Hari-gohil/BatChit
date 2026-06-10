const router = require("express").Router();

const {
  getDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getAllGroups,
  deleteGroup,
  removeMemberFromGroup,
  getAllMessages,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware")

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);

router.put("/users/block/:id", blockUser);

router.put("/users/unblock/:id", unblockUser);

router.delete("/users/:id", deleteUser);

router.get("/groups", getAllGroups);

router.delete("/groups/:id", deleteGroup);

router.delete("/groups/:groupId/members/:userId", removeMemberFromGroup);

router.get("/messages", getAllMessages);

module.exports = router;