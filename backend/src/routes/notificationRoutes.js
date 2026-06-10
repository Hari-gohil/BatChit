const router = require("express").Router();

const {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  createNotification
);

router.get(
  "/",
  authMiddleware,
  getNotifications
);

router.get(
  "/:id",
  authMiddleware,
  getNotificationById
);

router.put(
  "/read/:id",
  authMiddleware,
  markAsRead
);

router.put(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;