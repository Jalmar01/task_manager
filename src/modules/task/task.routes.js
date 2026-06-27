const express = require('express');

const taskController = require('./task.controller');
const authMiddleware = require('../../middlewares/auth.middleware')

const router = express.Router();

// todas las rutas de task deben estar protegidas
router.use(authMiddleware);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;