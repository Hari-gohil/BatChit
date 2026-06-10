const Group = require('../models/Group')

exports.createGroup = async (req, res) => {
  try {
    const { groupName, description, members } = req.body;

    const group = await Group.create({
      groupName,
      description,
      admin: req.user.id,
      members: [...members, req.user.id],
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const allGroups = await Group.find();

    const groups = await Group.find({
      members: req.user.id,
    });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("admin", "name email")
      .populate("members", "name email profilePic");

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    group.members = group.members.filter(
      (member) =>
        member.toString() !== req.user._id.toString()
    );

    await group.save();

    res.json({
      message: "Left group successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.status(200).json({
      message: "Member added successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    if (
      group.admin.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only admin can remove members",
      });
    }

    group.members = group.members.filter(
      (member) =>
        member.toString() !== userId
    );

    await group.save();

    res.json({
      message: "Member removed successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { groupName, description, groupImage } = req.body;

    const group = await Group.findByIdAndUpdate(
      req.params.id,
      {
        groupName,
        description,
        groupImage,
      },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const Message = require("../models/Message");

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(
      req.params.groupId
    );

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    if (
      group.admin.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Only admin can delete group",
      });
    }

    await Message.deleteMany({
      groupId: group._id,
    });

    await Group.findByIdAndDelete(
      group._id
    );

    res.json({
      message: "Group deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};