import { Router } from "express";
import * as controller from "../controllers/passes.controller";

const router = Router();

router.get("/", controller.getAll);              
router.get("/stats", controller.getStats);
router.get("/top-students", controller.getTopStudents);     
router.get("/search", controller.search);        
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
