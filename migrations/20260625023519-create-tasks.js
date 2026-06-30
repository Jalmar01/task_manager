'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id:{
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull:false,
        primaryKey: true
      },
      title:{
        type: Sequelize.STRING(100),
        allowNull:false
      },
      description:{
        type: Sequelize.TEXT
      },
      completed:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      userId:{
        type: Sequelize.UUID,
        allowNull:false,
        references: {
          model:'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt:{
        type: Sequelize.DATE,
        defaultValue:Sequelize.fn('NOW'),
        allowNull:false
      },
      updatedAt:{
        type: Sequelize.DATE,
        defaultValue:Sequelize.fn('NOW'),
        allowNull: false
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks');
  }
};
