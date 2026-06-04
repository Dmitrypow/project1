import { Router } from "express";
import * as controller from "../controllers/passes.controller";
import { demoAuth } from "../middleware/demo-auth.middleware";

const router = Router();

router.get("/", controller.getAll);
router.get("/stats", controller.getStats);
router.get("/top-students", controller.getTopStudents);
router.get("/search", controller.search);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", demoAuth, controller.update);     
router.delete("/:id", demoAuth, controller.remove);  

export default router;
