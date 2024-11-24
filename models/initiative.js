'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Initiative extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Initiative.belongsTo(models.User, { as: 'initiator', foreignKey: 'author' });
      Initiative.belongsTo(models.Project, {
        foreignKey: 'project_link',
        as: 'project'
      });
      Initiative.hasMany(models.Comment , {
        foreignKey: 'source_id',
        constraints: false,
        scope: {
          source_type: 'initiative'
        },
        as: 'comment'
      });
      Initiative.hasMany(models.Attachment, {
        foreignKey: 'source_id',
        constraints: false,
        scope: {
          source_type: 'initiative'
        },
        as: 'attachments'
      });
    }
  }
  Initiative.init({
    name: DataTypes.STRING,
    author: DataTypes.INTEGER,
    brief_desc: DataTypes.TEXT,
    full_desc: DataTypes.TEXT,
    // when initiative is created, it's open
    status: {
      type: DataTypes.ENUM,
      values: ['open', 'closed'],
      allowNull: false
    },
    project_link: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Initiative',
  });
  return Initiative;
};
