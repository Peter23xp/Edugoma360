import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

// List users
router.get("/", requirePermission("settings:read"), (req, res, next) =>
  usersController.getUsers(req, res, next),
);

// Create user
router.post("/", requirePermission("settings:update"), (req, res, next) =>
  usersController.createUser(req, res, next),
);

// Get default permissions for role
router.get(
  "/permissions/:role",
  requirePermission("settings:read"),
  (req, res, next) => usersController.getDefaultPermissions(req, res, next),
);

// Update permissions
router.put(
  "/:id/permissions",
  requirePermission("settings:update"),
  (req, res, next) => usersController.updatePermissions(req, res, next),
);

// Reset password
router.post(
  "/:id/reset-password",
  requirePermission("settings:update"),
  (req, res, next) => usersController.resetPassword(req, res, next),
);

// Toggle active status
router.put(
  "/:id/toggle-status",
  requirePermission("settings:update"),
  (req, res, next) => usersController.toggleStatus(req, res, next),
);

// Delete user
router.delete("/:id", requirePermission("settings:update"), (req, res, next) =>
  usersController.deleteUser(req, res, next),
);

export default router;
