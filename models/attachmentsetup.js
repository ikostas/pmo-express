'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AttachmentSetup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AttachmentSetup.init({
    Name: DataTypes.STRING,
    forProjects: DataTypes.BOOLEAN,
    forPrograms: DataTypes.BOOLEAN,
    forPortfolios: DataTypes.BOOLEAN,
    fileName: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'AttachmentSetup',
  });
  return AttachmentSetup;
};
