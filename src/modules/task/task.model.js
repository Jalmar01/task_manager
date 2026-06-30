const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Task = sequelize.define(
    'Task',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        }
    },
    {
        timestamps: true,
        tableName: 'tasks'
    }
);

module.exports = Task;
