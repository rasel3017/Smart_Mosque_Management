import express from "express";
import {
  addMosque,
  getMosquesByRegion,
  getMosqueDetails,
  searchMosque,
  deleteMosque,
} from "../controllers/mosque.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { validateAddMosque } from "../validation/mosque.validation.js";
const router = express.Router();

router.post("/",protect, adminOnly, validateAddMosque, addMosque);
router.get("/region/:region", getMosquesByRegion);
router.get("/:id", getMosqueDetails);
router.get("/search/:name", searchMosque);
router.delete("/:id", protect, adminOnly, deleteMosque);

export default router;