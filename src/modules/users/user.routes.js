const express = require('express');
const userController = require('./user.controller');

const router = express.Router();

router.post('/users', userController.createUser);

module.exports = router;

