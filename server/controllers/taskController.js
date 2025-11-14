const Task = require("../models/Task");
const Project = require("../models/Project");

exports.getAllTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "user") {
      query.assignedTo = req.user._id;
    } else if (req.user.role === "moderator") {
      const projects = await Project.find({ moderator: req.user._id });
      query.project = { $in: projects.map((p) => p._id) };
    }

    const tasks = await Task.find(query)
      .populate("project", "name status")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name status")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo } = req.body;

    if (!title || !project) {
      return res.status(400).json({ error: "Title and project are required" });
    }

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
    });

    await task.save();
    await task.populate("project assignedTo createdBy", "name email");

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      status,
      resolutionNote,
      attachments,
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (status) updateData.status = status;

    if (status === "resolved") {
      if (resolutionNote) updateData.resolutionNote = resolutionNote;
      updateData.resolvedAt = new Date();
      if (attachments) updateData.attachments = attachments;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("project assignedTo createdBy", "name email");

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyTask = async (req, res) => {
  try {
    const { approve } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.status !== "resolved") {
      return res
        .status(400)
        .json({ error: "Only resolved tasks can be verified" });
    }

    task.status = approve ? "verified" : "in-progress";
    if (approve) {
      task.verifiedAt = new Date();
    } else {
      task.verifiedAt = undefined;
      task.resolvedAt = undefined;
    }

    await task.save();
    await task.populate("project assignedTo createdBy", "name email");

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
