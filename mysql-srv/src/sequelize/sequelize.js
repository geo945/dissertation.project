const { Sequelize } = require('sequelize');
require('dotenv').config()

// Replace these values with the ones in your docker-compose.yml
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD, {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    benchmark: true, // enable query timing
    logging: (msg, time) => {
        return console.log(`${msg} (Executed in ${time} ms)`)
    },  // Log SQL queries and timing info
});

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection to MySQL database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
