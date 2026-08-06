import express from "express" 
import { createManager, getManager, getManagerProperties, updateManager } from "../controllers/managerControllers.js"


const router = express.Router()

router.get("/:cognitoId", getManager)
router.put("/:cognitoId", updateManager)
router.post("/", createManager)
router.get("/:cognitoId/properties", getManagerProperties)
// router.post("/:cognitoId/favorites/:propertyId", addFavoriteProperty)
// router.delete("/:cognitoId/favorites/:propertyId", removeFavoriteProperty)

export default router