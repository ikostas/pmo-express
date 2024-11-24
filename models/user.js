'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Project, { as: 'ManagedProjects', foreignKey: 'projectManager' });
      User.hasMany(models.Project, { as: 'SponsoredProjects', foreignKey: 'projectSponsor' });
      User.hasMany(models.Portfolio, { as: 'ownedPortfolios', foreignKey: 'owner' });
      User.hasMany(models.Portfolio, { as: 'sponsoredPortfolios', foreignKey: 'sponsor' });
      User.hasMany(models.Initiative, { as: 'CreatedInitiatives', foreignKey: 'author' });
      User.hasMany(models.Comment, { as: 'UsersComments', foreignKey: 'author' });
      User.hasMany(models.Issue, { as: 'UsersIssue', foreignKey: 'author' });
      User.hasMany(models.Issue, { as: 'OwnedRisks', foreignKey: 'owner' });
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
