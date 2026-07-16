import express from "express";
import {
  getNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
} from "../Controllers/NotificationController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const NotificationRouter = express.Router();

NotificationRouter.use(authMiddleware);

NotificationRouter.get("/",               getNotifications);
NotificationRouter.patch("/read-all",     markAllRead);
NotificationRouter.patch("/:id/read",     markOneRead);
NotificationRouter.delete("/:id",         deleteNotification);

export default NotificationRouter;
