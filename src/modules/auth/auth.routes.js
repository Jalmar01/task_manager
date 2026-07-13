const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.validation');

router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);

router.post('/refresh', validate(refreshSchema), authController.refresh);

router.post('/logout', validate(refreshSchema), authController.logout);

router.get('/me', authMiddleware, authController.me);

module.exports = router;
