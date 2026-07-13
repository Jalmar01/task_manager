const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    token: {
        type: DataTypes.STRING(512),
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'refresh_tokens',
    timestamps: true
});

module.exports = RefreshToken;
