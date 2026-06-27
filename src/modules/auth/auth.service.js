const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');

async function login ({ email, password }) {
    const user = await User.findOne({where: { email }})
    if(!user) {
        throw new Error('Invalid credentials')
    };

    const inValidPassword = await bcrypt.compare(password, user.password);
    if(!inValidPassword) {
        throw new Error('Invalid credentials')
    };

    const token = jwt.sign(
        {
            id:user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {expiresIn:'1d'}
    )
    return {token}
};

async function getMe(userId) {
    const user = await User.findByPk(userId);
    if(!user){
        throw new Error('User not found');
    }

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return userWithoutPassword;
};

module.exports = {login, getMe};
