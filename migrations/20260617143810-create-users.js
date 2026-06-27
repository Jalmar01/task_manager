'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.createTable('users', {
       id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
       },
       name: {
        type: Sequelize.STRING(55),
        allowNull:false
       },
       email:{
        type:  Sequelize.STRING(100),
        unique: true,
        allowNull: false
       },
       password:{
        type: Sequelize.STRING(100),
        allowNull: true
       },
       provider:{
        type: Sequelize.STRING(25),
        allowNull:false
       },
       createdAt:{
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
        type: Sequelize.DATE
       },
       updatedAt:{
         allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
        type: Sequelize.DATE
       }
      });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users')
  }
};
