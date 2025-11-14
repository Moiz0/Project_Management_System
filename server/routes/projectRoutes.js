const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { auth, checkRole } = require("../middleware/auth");

router.get("/", auth, projectController.getAllProjects);
router.get("/:id", auth, projectController.getProjectById);
router.post(
  "/",
  auth,
  checkRole("admin", "moderator"),
  projectController.createProject
);
router.put(
  "/:id",
  auth,
  checkRole("admin", "moderator"),
  projectController.updateProject
);
router.delete(
  "/:id",
  auth,
  checkRole("admin", "moderator"),
  projectController.deleteProject
);

module.exports = router;
