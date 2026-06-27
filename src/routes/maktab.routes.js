import express from "express";
import {
  addMaktab,
  getMaktabsByMosque,
  getAllMaktabs,
  enrollStudent,
  getStudentsByMaktab,
  addFunding,
  getFundingHistory,
} from "../controllers/maktab.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { validateAddMaktab, validateEnrollStudent, validateAddFunding } from "../validation/maktab.validation.js";

const router = express.Router();

router.post("/", protect, adminOnly, validateAddMaktab, addMaktab);
router.get("/mosque/:mosqueId", getMaktabsByMosque);
router.get("/", getAllMaktabs);
router.post("/:maktabId/students", protect, adminOnly, validateEnrollStudent, enrollStudent);
router.get("/:maktabId/students", getStudentsByMaktab);
router.post("/:maktabId/funding", protect, validateAddFunding, addFunding);
router.get("/:maktabId/funding", getFundingHistory);

export default router;