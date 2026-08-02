import express from "express" 
import { createManager, getManager } from "../controllers/managerControllers.js"


const router = express.Router()

router.get("/:cognitoId", getManager)
// router.put("/:cognitoId", updateTenant)
router.post("/", createManager)
// router.get("/:cognitoId/current-residences", getCurrentResidences)
// router.post("/:cognitoId/favorites/:propertyId", addFavoriteProperty)
// router.delete("/:cognitoId/favorites/:propertyId", removeFavoriteProperty)

export default router