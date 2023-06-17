const { Sequelize } = require('sequelize');
const config = require('../config');

const env = process.env.NODE_ENV || 'development';
const connectionConfig = config[env];

// Create the Sequelize instance with the database configuration
const sequelize = new Sequelize(
  connectionConfig.database,
  connectionConfig.username,
  connectionConfig.password,
  {
    host: connectionConfig.host,
    dialect: connectionConfig.dialect,
  }
);

// Function to create the database if it doesn't exist
const createDatabase = async () => {
  try {

    // Connect to the default database (usually 'mysql')
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${connectionConfig.database}`);
    console.log('Database created successfully or already exists!');

  } catch (error){
    
    if (error.original && error.original.errno === 1146) {
      // Table doesn't exist error
      console.error(`Table '${connectionConfig.database}.users' doesn't exist`);
    } else {
      // Other errors
      console.error('Error creating database:', error);
    }
  }
};

// Define the models and perform database operations
const initializeDatabase = async () => {
  try {
    // Create the database if it doesn't exist
    await createDatabase();

    // Reinitialize the Sequelize instance with the database name
    sequelize.options.database = connectionConfig.database;

    // Import the User and Journal models
    const UserModel = require('../models/user');
    const JournalModel = require('../models/journal');

    // Synchronize the models with the database schema
    await sequelize.sync();
    console.log('Database schema synchronized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Call the initializeDatabase function during initialization
initializeDatabase();

module.exports = sequelize;
