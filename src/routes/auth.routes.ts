import { Router } from "express";
import AuthController from "@/controllers/auth.controller";

const router = Router();

router.post("/request-code", AuthController.requestCode);

export default router;