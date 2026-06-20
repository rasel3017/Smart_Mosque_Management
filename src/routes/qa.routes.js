import express from "express";
import {
  postQuestion,
  postAnswer,
  getAllQuestions,
  getAnswersByQuestion,
  deleteQuestion,
} from "../controllers/qa.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { validatePostQuestion , validatePostAnswer } from "../validation/qa.validation.js";

const router = express.Router();

router.post("/questions", protect, validatePostQuestion, postQuestion);
router.post("/questions/:questionId/answers", protect, validatePostAnswer, postAnswer);
router.get("/questions", getAllQuestions);
router.get("/questions/:questionId/answers", getAnswersByQuestion);
router.delete("/questions/:questionId", protect, adminOnly, deleteQuestion);

export default router;