const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const RefreshToken = require('./refresh-token.model');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}

async function saveRefreshToken(userId, token) {
    const hashed = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await RefreshToken.create({
        token: hashed,
        userId,
        expiresAt
    });
}

async function login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
}

async function refreshAccessToken(refreshToken) {
    const hashed = hashToken(refreshToken);
    const record = await RefreshToken.findOne({
        where: {
            token: hashed,
            expiresAt: { [require('sequelize').Op.gt]: new Date() }
        }
    });

    if (!record) {
        throw new Error('Invalid or expired refresh token');
    }

    // Delete the old refresh token (rotation)
    await record.destroy();

    // Get user and issue new tokens
    const user = await User.findByPk(record.userId);
    if (!user) {
        throw new Error('User not found');
    }

    const newAccessToken = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const newRefreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout(refreshToken) {
    const hashed = hashToken(refreshToken);
    await RefreshToken.destroy({ where: { token: hashed } });
}

async function getMe(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return userWithoutPassword;
}

module.exports = { login, getMe, refreshAccessToken, logout };
