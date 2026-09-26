import express from "express";
import { protect, adminOnly } from "../../middleware/authMiddleware.js";
import {
    getMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from "../controllers/menuController.js";

const router = express.Router();

// Public Routes
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

// Admin Routes
router.post("/", protect, adminOnly, createMenuItem);
router.put("/:id", protect, adminOnly, updateMenuItem);
router.delete("/:id", protect, adminOnly, deleteMenuItem);

export default router;
