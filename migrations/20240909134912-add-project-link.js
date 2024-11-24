'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Projects', 'link_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('Projects', 'link_source', {
      type: Sequelize.ENUM('portfolio', 'program'),
      allowNull: true,
      defaultValue: null
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Projects', 'link_id');
    await queryInterface.removeColumn('Projects', 'link_source');
  }
};
