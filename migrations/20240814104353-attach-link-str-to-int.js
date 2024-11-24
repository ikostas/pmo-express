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
    await queryInterface.changeColumn('Attachments', 'source_id', {
      type: Sequelize.INTEGER,
      allowNull: false, // Set this to true if the field can be null
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('Attachments', 'source_id', {
      type: Sequelize.STRING,
      allowNull: false, // Set this to true if the field can be null
    });
  }
};
