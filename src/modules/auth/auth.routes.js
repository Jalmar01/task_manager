const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');


router.post('/login', authController.login);
// ruta protegida de prueba

router.get('/me', authMiddleware, authController.me);


module.exports = router;
