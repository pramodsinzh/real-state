import express from "express";
 
import multer from "multer"; 
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createProperty, deleteProperty, getProperties, getProperty, getPropertyLeases, updateProperty } from "../controllers/propertyControllers.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", authMiddleware(["manager"]), upload.array("photos"), createProperty);
router.put("/:id", authMiddleware(["manager"]), upload.array("photos"), updateProperty);
router.delete("/:id", authMiddleware(["manager"]), deleteProperty);
router.get("/:id/leases", authMiddleware(["manager"]), getPropertyLeases)

export default router;