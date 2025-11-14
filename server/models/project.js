const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Project name is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Moderator is required"],
  },
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: {
      values: ["active", "completed"],
      message: "Status must be active or completed",
    },
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
projectSchema.index({ moderator: 1 });
projectSchema.index({ teamMembers: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model("Project", projectSchema);
