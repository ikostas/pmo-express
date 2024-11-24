'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Issue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Issue.belongsTo(models.User, { as: 'Author', foreignKey: 'author' });
      Issue.belongsTo(models.User, { as: 'Owner', foreignKey: 'owner' });
      Issue.belongsTo(models.Project, { as: 'Project', foreignKey: 'project' });
      Issue.hasMany(models.Attachment, {
        foreignKey: 'source_id',
        constraints: false,
        scope: {
          source_type: 'issue'
        }
      });
      Issue.hasMany(models.Comment , {
        foreignKey: 'source_id',
        as: 'comment',
        constraints: false,
        scope: {
          source_type: 'issue'
        },
        as: 'comment'
      });
    }
  }
  Issue.init({
    type: {
      type: DataTypes.ENUM,
      values: ['concern', 'change', 'problem', 'risk', 'off-specification'],
      allowNull: false
    },
    name: DataTypes.STRING,
    date_raised: DataTypes.DATE,
    author: DataTypes.INTEGER,
    priority: DataTypes.INTEGER,
    severity: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM,
      values: ['requested', 'approved', 'closed'],
      allowNull: false
    },
    closure_date: DataTypes.DATE,
    description: DataTypes.TEXT,
    project: DataTypes.INTEGER,
    // fields specific for risks
    risk_probability: DataTypes.INTEGER,
    risk_impact: DataTypes.INTEGER,
    owner: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Issue',
  });
  return Issue;
};
