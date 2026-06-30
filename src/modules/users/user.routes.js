const express = require('express');
const userController = require('./user.controller');
const validate = require('../../middlewares/validate');
const { createUserSchema } = require('./user.validation');

const router = express.Router();

router.post('/users', validate(createUserSchema), userController.createUser);

module.exports = router;
