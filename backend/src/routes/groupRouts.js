const router = require("express").Router();

const {
  createGroup,
  getGroups,
  getGroupById,
  addMember,
  removeMember,
  updateGroup,
  deleteGroup,
  leaveGroup,
} = require("../controllers/groupController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createGroup);

router.get("/", authMiddleware, getGroups);

router.get("/:id", authMiddleware, getGroupById);

router.put("/:id", authMiddleware, updateGroup);

router.put("/:id/add-member", authMiddleware, addMember);

router.put("/:groupId/leave", authMiddleware, leaveGroup);

router.put("/:groupId/remove/:userId", authMiddleware, removeMember);

router.delete("/:groupId", authMiddleware, deleteGroup);

module.exports = router;
