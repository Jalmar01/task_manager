const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const User = sequelize.define(
    'User',
    {
     id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
       },
       name: {
        type: DataTypes.STRING(55),
        allowNull:false
       },
       email:{
        type:  DataTypes.STRING(100),
        unique: true,
        allowNull: false
       },
       password:{
        type: DataTypes.STRING(100),
        allowNull: true
       },
       provider:{
        type: DataTypes.STRING(25),
        allowNull:false
       },
    },
    {
        timestamps:true,
        tableName:'users'
    }, 
);

module.exports= User;