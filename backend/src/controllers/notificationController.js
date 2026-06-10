const Notification = require('../models/Notification')

exports.createNotification = async (req, res) => {
  try {
    const { user, sender, message } = req.body;

    const notification = await Notification.create({
      user,
      sender,
      message,
    });

    res.status(201).json(notification);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    console.log("Logged User:", req.user.id);

 const notifications = await Notification.find();
console.log("All Notifications:", notifications);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(
      req.params.id
    ).populate("sender", "name profilePic");

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification =
      await Notification.findByIdAndUpdate(
        req.params.id,
        {
          isRead: true,
        },
        { new: true }
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification =
      await Notification.findByIdAndDelete(
        req.params.id
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};