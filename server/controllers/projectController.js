const Project = require("../models/Project");
const Task = require("../models/Task");

exports.getAllProjects = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "moderator") {
      query.moderator = req.user._id;
    } else if (req.user.role === "user") {
      query.teamMembers = req.user._id;
    }
    const projects = await Project.find(query)
      .populate("moderator", "name email role")
      .populate("teamMembers", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("moderator", "name email role")
      .populate("teamMembers", "name email role");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, moderator, teamMembers, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const projectData = {
      name,
      description,
      teamMembers: teamMembers || [],
      status: status || "active",
    };

    if (req.user.role === "moderator") {
      projectData.moderator = req.user._id;
    } else if (req.user.role === "admin") {
      if (!moderator) {
        return res.status(400).json({ error: "Moderator is required" });
      }
      projectData.moderator = moderator;
    }

    const project = new Project(projectData);
    await project.save();

    await project.populate("moderator teamMembers", "name email role");
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, moderator, teamMembers, status } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (
      req.user.role === "moderator" &&
      project.moderator.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You can only update your own projects" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (teamMembers !== undefined) updateData.teamMembers = teamMembers;
    if (status) updateData.status = status;

    if (moderator && req.user.role === "admin") {
      updateData.moderator = moderator;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("moderator teamMembers", "name email role");

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (
      req.user.role === "moderator" &&
      project.moderator.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You can only delete your own projects" });
    }

    await Project.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ project: req.params.id });

    res.json({ message: "Project and associated tasks deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
