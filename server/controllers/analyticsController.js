const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.getSystemAnalytics = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: "active" });
    const completedProjects = await Project.countDocuments({
      status: "completed",
    });
    const totalTasks = await Task.countDocuments();

    const tasksByStatus = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = {
      open: 0,
      "in-progress": 0,
      resolved: 0,
      verified: 0,
    };

    tasksByStatus.forEach((item) => {
      if (taskDistribution.hasOwnProperty(item._id)) {
        taskDistribution[item._id] = item.count;
      }
    });

    res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      taskDistribution,
    });
  } catch (error) {
    console.error("System analytics error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const totalTasks = await Task.countDocuments({ project: projectId });

    const tasksByStatus = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = {
      open: 0,
      "in-progress": 0,
      resolved: 0,
      verified: 0,
    };

    tasksByStatus.forEach((item) => {
      if (taskDistribution.hasOwnProperty(item._id)) {
        taskDistribution[item._id] = item.count;
      }
    });

    const userPerformance = await Task.aggregate([
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
          status: { $in: ["resolved", "verified"] },
          assignedTo: { $exists: true, $ne: null },
        },
      },
      { $group: { _id: "$assignedTo", resolvedTasks: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          name: "$user.name",
          email: "$user.email",
          resolvedTasks: 1,
        },
      },
      { $sort: { resolvedTasks: -1 } },
    ]);

    res.json({
      totalTasks,
      taskDistribution,
      userPerformance,
    });
  } catch (error) {
    console.error("Project analytics error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getUserPerformance = async (req, res) => {
  try {
    const performance = await Task.aggregate([
      {
        $match: {
          status: { $in: ["resolved", "verified"] },
          assignedTo: { $exists: true, $ne: null },
        },
      },
      { $group: { _id: "$assignedTo", resolvedTasks: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          name: "$user.name",
          email: "$user.email",
          resolvedTasks: 1,
        },
      },
      { $sort: { resolvedTasks: -1 } },
    ]);

    res.json(performance);
  } catch (error) {
    console.error("User performance error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getModeratorPerformance = async (req, res) => {
  try {
    const moderators = await User.find({ role: "moderator" });
    const performance = [];

    for (const mod of moderators) {
      const projects = await Project.find({ moderator: mod._id });
      const projectIds = projects.map((p) => p._id);

      const totalTasks = await Task.countDocuments({
        project: { $in: projectIds },
      });
      const completedTasks = await Task.countDocuments({
        project: { $in: projectIds },
        status: { $in: ["resolved", "verified"] },
      });

      const completionRate =
        totalTasks > 0
          ? ((completedTasks / totalTasks) * 100).toFixed(2)
          : "0.00";

      performance.push({
        moderator: {
          id: mod._id.toString(),
          name: mod.name,
          email: mod.email,
        },
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        completionRate: completionRate,
      });
    }

    performance.sort(
      (a, b) => parseFloat(b.completionRate) - parseFloat(a.completionRate)
    );

    res.json(performance);
  } catch (error) {
    console.error("Moderator performance error:", error);
    res.status(400).json({ error: error.message });
  }
};
