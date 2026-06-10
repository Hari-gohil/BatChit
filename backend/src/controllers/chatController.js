const Chat = require("../models/Chat");
const User = require("../models/User");

exports.createChat = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver ID is required",
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: {
        $all: [req.user._id, receiverId],
      },
    });

    if (chat) {
      chat.deletedFor = chat.deletedFor.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );

      await chat.save();

      return res.status(200).json(chat);
    }

    const newChat = await Chat.create({
      participants: [req.user._id, receiverId],
    });

    const populatedChat = await Chat.findById(newChat._id).populate(
      "participants",
      "name email profilePic"
    );

    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] },
      deletedFor: { $nin: [req.user._id] },
    })
      .populate("participants", "name email profilePic isOnline")
      .populate("lastMessage");

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participants", "name email profilePic")
      .populate("lastMessage");

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.findChat = async (req, res) => {
  try {
    const { userId } = req.params;

    const chat = await Chat.findOne({
      participants: {
        $all: [req.user.id, userId],
      },
    });

    if (!chat) {
      return res.status(404).json({
        message: "No chat found",
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteChatForMe = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    if (!chat.deletedFor.includes(req.user.id)) {
      chat.deletedFor.push(req.user.id);
    }

    await chat.save();

    res.json({
      message: "Chat deleted for you",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteChatForEveryone = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    await Message.deleteMany({
      chat: chat._id,
    });

    await Chat.findByIdAndDelete(chat._id);

    res.json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
