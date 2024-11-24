'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Attachment.init({
    source_type: {
      type: DataTypes.ENUM,
      // I'm not sure if I need different types of issues, except for risks, anyway
      values: ['initiative', 'project_result', 'project_docs', 'portfolio', 'issue', 'status'],
      allowNull: false
    },
    source_id: DataTypes.INTEGER, // id of the project or other item
    name: DataTypes.STRING, // the name of the file, as it will be diplayed
    link: DataTypes.STRING // the path and the filename as stored
  }, {
    sequelize,
    modelName: 'Attachment',
  });
  return Attachment;
};
