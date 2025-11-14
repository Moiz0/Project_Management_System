const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { auth, checkRole } = require("../middleware/auth");

router.get("/", auth, taskController.getAllTasks);
router.get("/:id", auth, taskController.getTaskById);
router.post(
  "/",
  auth,
  checkRole("admin", "moderator"),
  taskController.createTask
);
router.put("/:id", auth, taskController.updateTask);
router.patch(
  "/:id/verify",
  auth,
  checkRole("admin", "moderator"),
  taskController.verifyTask
);
router.delete(
  "/:id",
  auth,
  checkRole("admin", "moderator"),
  taskController.deleteTask
);

module.exports = router;
