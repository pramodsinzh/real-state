import express from "express";
 
import multer from "multer"; 
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createProperty, getProperties, getProperty, getPropertyLeases } from "../controllers/propertyControllers.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", authMiddleware(["manager"]), upload.array("photos"), createProperty);
router.get("/:id/leases", authMiddleware(["manager"]), getPropertyLeases)

export default router;