import { Router } from "express";
import * as controller from "../controllers/zones.controller";

const router = Router();
router.get("/", controller.getAll);

export default router;