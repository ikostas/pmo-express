'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Issues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('concern', 'change', 'problem', 'risk', 'off-specification')
      },
      date_raised: {
        type: Sequelize.DATE
      },
      author: {
        type: Sequelize.INTEGER
      },
      priority: {
        type: Sequelize.INTEGER
      },
      severity: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM('requested', 'approved', 'closed')
      },
      closure_date: {
        type: Sequelize.DATE
      },
      description: {
        type: Sequelize.TEXT
      },
      project: {
        type: Sequelize.INTEGER
      },
      risk_probability: {
        type: Sequelize.INTEGER
      },
      risk_impact: {
        type: Sequelize.INTEGER
      },
      owner: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Issues');
  }
};
