const {Sequelize,DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('teacher', 'student'),
    allowNull: false,
  },
});

// Create the table in the database
(async () => {
  try {
    await User.sync();
    console.log('Users table created successfully.');
  } catch (error) {
    console.error('Error creating Users table:', error);
  }
})();
module.exports = User;
