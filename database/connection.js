const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');


dotenv.config();

const DATABASE = process.env.DB_DATABASE;
const USER     = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const HOST     = process.env.DB_HOST;
const DIALECT  = process.env.DB_DIALECT;

 
const sequelize = new Sequelize(
    DATABASE,
    USER,
    PASSWORD,
    {
        host: HOST,
        dialect: DIALECT
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');
    }catch (error) {
        console.log('❌ Database connection failed', error);
    }
};

module.exports = {
    sequelize,
    testConnection
}
