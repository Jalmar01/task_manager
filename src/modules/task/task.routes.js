const express = require('express');

const taskController = require('./task.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate');
const { createTaskSchema, updateTaskSchema, getTasksSchema } = require('./task.validation');

const router = express.Router();

// todas las rutas de task deben estar protegidas
router.use(authMiddleware);

router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', validate(getTasksSchema, 'query'), taskController.getTasks);

router.get('/:id', taskController.getTaskById);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
