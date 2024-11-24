'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      author: {
        type: Sequelize.INTEGER
      },
      project: {
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('red', 'green', 'yellow'),
        allowNull: false,
        defaultValue: 'green'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Statuses');
  }
};
