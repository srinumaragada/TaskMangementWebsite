const express = require("express");
const { createTask, getTask, getTasks, updateTask, deleteTask, completeTask, deleteCompleteTask } = require("../controller/AddTask");
const { authMiddleware } = require("../controller/auth");



const router = express.Router();
router.use(authMiddleware)
router.post("/createTask",createTask)
router.get("/getTasks",getTasks)
router.get("/getTask/:id",getTask)
router.put("/updateTask/:id",updateTask)
router.delete("/deleteTask/:id",deleteTask)
router.put('/complete/:id', completeTask);
router.delete("/deleteCompleteTask",deleteCompleteTask)


module.exports = router;
