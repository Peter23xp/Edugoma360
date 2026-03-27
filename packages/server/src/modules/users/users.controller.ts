import { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service";

class UsersController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, status, search } = req.query;
      const result = await usersService.getUsers({
        schoolId: req.user!.schoolId,
        role: role as string | undefined,
        status: status as "ACTIVE" | "INACTIVE" | undefined,
        search: search as string | undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.createUser(
        req.user!.schoolId,
        req.body,
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updatePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const result = await usersService.updatePermissions(
        id,
        req.user!.schoolId,
        permissions,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await usersService.resetPassword(
        id,
        req.user!.schoolId,
        req.body,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await usersService.toggleStatus(id, req.user!.schoolId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await usersService.deleteUser(id, req.user!.schoolId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDefaultPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.params;
      const permissions = usersService.getDefaultPermissions(role);
      res.json({ permissions });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
