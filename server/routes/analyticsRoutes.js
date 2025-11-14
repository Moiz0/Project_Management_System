const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { auth, checkRole } = require("../middleware/auth");

router.get(
  "/system",
  auth,
  checkRole("admin"),
  analyticsController.getSystemAnalytics
);
router.get(
  "/project/:projectId",
  auth,
  checkRole("admin", "moderator"),
  analyticsController.getProjectAnalytics
);
router.get(
  "/users",
  auth,
  checkRole("admin", "moderator"),
  analyticsController.getUserPerformance
);
router.get(
  "/moderators",
  auth,
  checkRole("admin"),
  analyticsController.getModeratorPerformance
);

module.exports = router;
