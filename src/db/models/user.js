'use strict';
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Permission, { foreignKey: "PermissionId" })
    }
  }
  User.init({
    discordId: DataTypes.STRING,
    username: DataTypes.STRING,
    PermissionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: "User",
  });
  return User;
};