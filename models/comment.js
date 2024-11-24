'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comment.belongsTo(models.User, { as: 'CommentAuthor', foreignKey: 'author' });
    }
  }
  Comment.init({
    author: DataTypes.INTEGER,
    date: DataTypes.DATE,
    source_type: {
      type: DataTypes.ENUM,
      values: ['initiative', 'issue', 'project', 'status'],
      allowNull: false,
    },
    source_id: DataTypes.INTEGER,
    comment: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};
