import express from "express";
import {
  getEmployeeRankings,
  getTopPerformers,
  getDeadlineRankings
} from "../Controllers/ranking.controller.js";

const router = express.Router();

// GET all employee rankings with pagination and filters
router.get("/rankings", getEmployeeRankings);

// GET top performers for dashboard
router.get("/top-performers", getTopPerformers);


router.get("/deadline-rankings", getDeadlineRankings);

export default router;