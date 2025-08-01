'use strict';
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CommandUsage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        CommandUsage.belongsTo(models.User, { foreignKey: "userId" })
    }
  }
  CommandUsage.init({
    userId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: "CommandUsage",
    tableName: "CommandUsages",
    timestamps: true
  });

  return CommandUsage;
};