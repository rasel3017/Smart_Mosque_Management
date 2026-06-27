import express from "express";
import {
  addMosque,
  getMosquesByRegion,
  getMosqueDetails,
  searchMosque,
  deleteMosque,
  addMosqueFunding,
  getMosqueFundingHistory,
} from "../controllers/mosque.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { validateAddMosque } from "../validation/mosque.validation.js";
import { validateAddFunding } from "../validation/maktab.validation.js";

const router = express.Router();

router.post("/",protect, adminOnly, validateAddMosque, addMosque);
router.get("/region/:region", getMosquesByRegion);
router.get("/:id", getMosqueDetails);
router.get("/search/:name", searchMosque);
router.delete("/:id", protect, adminOnly, deleteMosque);
router.post("/:mosqueId/funding", protect, validateAddFunding,addMosqueFunding);
router.get("/:mosqueId/funding", getMosqueFundingHistory);

export default router;