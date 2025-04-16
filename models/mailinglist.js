'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MailingList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MailingList.belongsTo(models.User, { as: 'statusParticipant', foreignKey: 'user' });
      MailingList.belongsTo(models.Status, { as: 'statusML', foreignKey: 'status' });
    }
  }
  MailingList.init({
    user: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MailingList',
  });
  return MailingList;
};
