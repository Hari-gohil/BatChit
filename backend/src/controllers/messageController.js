const Message = require("../models/Message");
const Chat = require("../models/Chat");

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, groupId, receiverId, status, text, audio } = req.body;
    
    let image = req.body.image || "";
    let video = req.body.video || "";

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith("video/");
      const fileUrl = `/uploads/${req.file.filename}`;
      if (isVideo) {
        video = fileUrl;
      } else {
        image = fileUrl;
      }
    }

    if (!chatId && !groupId) {
      return res.status(400).json({
        message: "Chat ID or Group ID is required",
      });
    }

    const message = await Message.create({
      chat: chatId || null,
      group: groupId || null,
      sender: req.user.id,
      receiver: receiverId || null,
      status: "sent",
      text,
      image,
      video,
      audio,
    });
    if (chatId) {
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
      });
    }

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name profilePic")
      .populate("receiver", "name profilePic");

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name profilePic")
      .populate("receiver", "name profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      group: req.params.groupId,
    })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      {
        seen: true,
      },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { text } = req.body;

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(
      req.params.messageId
    );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (
      message.sender.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await Message.findByIdAndDelete(
      req.params.messageId
    );

    res.json({
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteAllMessages = async (
  req,
  res
) => {
  try {
    await Message.deleteMany({
      chat: req.params.chatId,
    });

    res.json({
      message:
        "All messages deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
