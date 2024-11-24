'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Project.belongsTo(models.User, { as: 'Manager', foreignKey: 'projectManager' });
      Project.belongsTo(models.User, { as: 'Sponsor', foreignKey: 'projectSponsor' });
      Project.hasMany(models.Attachment, {
        foreignKey: 'source_id',
        as: 'project_result',
        constraints: false,
        scope: {
          source_type: 'project_result'
        }
      });
      Project.hasMany(models.Attachment, {
        foreignKey: 'source_id',
        as: 'project_docs',
        constraints: false,
        scope: {
          source_type: 'project_docs'
        }
      });
      Project.hasMany(models.Comment, {
        as: 'comment',
        foreignKey: 'source_id',
        constraints: false,
        scope: {
          source_type: 'project'
        }
      });
      Project.hasMany(models.Issue, {
        foreignKey: 'project',
        as: 'Issues',
        constraints: false,
      });
      Project.hasMany(models.Status, {
        as: 'statuses',
        foreignKey: 'project',
        constraints: false,
      });
      Project.belongsTo(models.Portfolio, {
        foreignKey: 'link_id',
        as: 'portfolio',
        constraints: false, 
      });
      Project.belongsTo(models.Project, {
        foreignKey: 'link_id',
        as: 'program',
        constraints: false,
      });
      Project.hasMany(models.Project, {
        foreignKey: 'link_id',
        as: 'programProjects',
        constraints: false,
        scope: {
          link_source: 'program'
        }
      });
    }
  }
  Project.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    projectManager: DataTypes.INTEGER,
    projectSponsor: DataTypes.INTEGER,
    projectStatus: {
      type: DataTypes.ENUM,
      values: ['open', 'closed'],
      allowNull: false
    },
    projectType: {
      type: DataTypes.ENUM,
      values: ['project', 'task', 'program'],
      allowNull: false
    },
    profitability: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    budget: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    link_id: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    link_source: {
      type: DataTypes.ENUM,
      values: ['portfolio', 'program'],
      allowNull: true 
    },
  }, {
    sequelize,
    modelName: 'Project',
  });
  return Project;
};

/* async function getPortfolioYear(linkId) {
  const portfolio = await Portfolio.findByPk(linkId);
  return portfolio.year;
}
async function getProgramName(linkId) {
  const program = await Project.findByPk(linkId);
  return program.name;
} */
