import { Router } from "express";
import * as controller from "../controllers/passes.controller";

const router = Router();

router.get("/", controller.getAll);              // GET /api/passes?reason=...&limit=...
router.get("/stats", controller.getStats);       // GET /api/passes/stats (агрегація)
router.get("/search", controller.search);        // GET /api/passes/search?q=... (SQLi demo)
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
