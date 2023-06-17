const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");
const User = require("./user");

const Journal = sequelize.define("Journal", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taggedStudents: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      const value = this.getDataValue("taggedStudents");
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue("taggedStudents", JSON.stringify(value));
    },
  },
  attachment: {
    type: DataTypes.JSONB, // Store attachment as JSON object
    allowNull: true,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

Journal.belongsTo(User, { as: "teacher", foreignKey: "teacherId" });

module.exports = Journal;
