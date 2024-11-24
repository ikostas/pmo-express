'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Portfolio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Portfolio.belongsTo(models.User, { as: 'portfolioOwner', foreignKey: 'owner' });
      Portfolio.belongsTo(models.User, { as: 'portfolioSponsor', foreignKey: 'sponsor' });
      Portfolio.hasMany(models.Attachment, {
        foreignKey: 'source_id',
        as: 'portfolioAttach',
        constraints: false,
        scope: {
          source_type: 'portfolio'
        }
      });
      Portfolio.hasMany(models.Project, {
        foreignKey: 'link_id',
        as: 'portfolioProjects',
        constraints: false,
        scope: {
          link_source: 'portfolio'
        }
      });
      // define association here
    }
  }
  Portfolio.init({
    owner: DataTypes.INTEGER,
    sponsor: DataTypes.INTEGER,
    year: DataTypes.INTEGER
  }, {
    sequelize,

    modelName: 'Portfolio',
  });
  return Portfolio;
};
