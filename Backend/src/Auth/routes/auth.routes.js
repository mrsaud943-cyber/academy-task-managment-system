import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controllers.js";

import checkToken from "../../Middleware/checkToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", checkToken, getCurrentUser);

export default router;