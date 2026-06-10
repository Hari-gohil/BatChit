const router = require("express").Router();

const {
  sendMessage,
  getMessages,
  markAsSeen,
  deleteMessage,
  editMessage,
  getGroupMessages,
  deleteAllMessages,
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", authMiddleware, upload.single("file"), sendMessage);

router.get(
  "/:chatId",
  authMiddleware,
  getMessages
);

router.get(
  "/group/:groupId",
  authMiddleware,
  getGroupMessages
);

router.put(
  "/seen/:id",
  authMiddleware,
  markAsSeen
);

router.put(
  "/edit/:id",
  authMiddleware,
  editMessage
);

router.delete(
  "/:messageId",
  authMiddleware,
  deleteMessage
);

router.delete(
  "/chat/:chatId",
  authMiddleware,
  deleteAllMessages
);

module.exports = router;