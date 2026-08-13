import express from "express"
import { addFavoriteProperty, createTenant, getCurrentResidences, getTenant, getTenantLeases, removeFavoriteProperty, updateTenant } from "../controllers/tenantControllers.js"


const router = express.Router()

router.get("/:cognitoId", getTenant)
router.put("/:cognitoId", updateTenant)
router.post("/", createTenant)
router.get("/:cognitoId/current-residences", getCurrentResidences)
router.get("/:cognitoId/leases", getTenantLeases)
router.post("/:cognitoId/favorites/:propertyId", addFavoriteProperty)
router.delete("/:cognitoId/favorites/:propertyId", removeFavoriteProperty)

export default router