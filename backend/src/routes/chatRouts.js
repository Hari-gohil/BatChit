const router = require("express").Router();

const {
  createChat,
  getChats,
  getChatById,
  findChat,
  deleteChat,
  deleteChatForMe,
  deleteChatForEveryone,
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createChat);

router.get("/", authMiddleware, getChats);

router.get("/find/:userId", authMiddleware, findChat);

router.get("/:id", authMiddleware, getChatById);

router.delete("/:chatId/me",authMiddleware, deleteChatForMe);

router.delete("/:chatId/everyone", authMiddleware ,deleteChatForEveryone);

module.exports = router;
