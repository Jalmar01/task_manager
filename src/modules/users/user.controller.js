const userService = require('./user.service');

async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);

        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;

        return res.status(201).json({
            message: 'User created successfully',
            data: userWithoutPassword
        });
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
}

module.exports = { createUser };
