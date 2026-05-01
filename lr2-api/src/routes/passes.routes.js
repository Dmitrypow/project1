const { Router } = require("express");
const controller = require("../controllers/passes.controller");
const { getTopByReason } = require("../controllers/passes.controller");
const router = Router();
const express = require("express")
const passesController = require("../controllers/passes.controller")

router.get("/", controller.getAll);
router.get("/top-by-reason", controller.getTopByReason);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);


module.exports = router;

