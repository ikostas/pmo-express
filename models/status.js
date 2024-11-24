'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Status extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Status.belongsTo(models.Project, { as: 'project_status', foreignKey: 'project' });
      Status.belongsTo(models.User, { as: 'status_author', foreignKey: 'author' });
      Status.hasMany(models.Attachment, {
        foreignKey: 'source_id',
        as: 'status_docs',
        constraints: false,
        scope: {
          source_type: 'status'
        }
      });
      Status.hasMany(models.Comment, {
        as: 'comment',
        foreignKey: 'source_id',
        constraints: false,
        scope: {
          source_type: 'status'
        }
      });
      Status.hasMany(models.Attachment, {
        foreignKey: 'source_id',
        as: 'statusAttach',
        constraints: false,
        scope: {
          source_type: 'status'
        }
      });
      Status.hasMany(models.MailingList, {
        foreignKey: 'status',
        as: 'statusML',
        constraints: false,
      });
    }
  }
  Status.init({
    date: DataTypes.DATE,
    author: DataTypes.INTEGER,
    project: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM,
      values: ['red', 'green', 'yellow'],
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Status',
  });
  return Status;
};
