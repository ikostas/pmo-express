'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn( 'Projects', 'profitability', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    });
    await queryInterface.addColumn( 'Projects', 'budget', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Projects', 'profitability');
    await queryInterface.removeColumn('Projects', 'budget');
  }
};
