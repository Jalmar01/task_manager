require('dotenv').config();

const app = require('./app');
const { sequelize } = require('../database/connection');
const setupAssociations = require('../database/associations');

const PORT = process.env.PORT || 3000;

async function startServer(){
    try{
        await sequelize.authenticate();
        setupAssociations();
        console.log('✅ Database connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`)
        })
    }catch(error){
        console.error('❌ Error starting server:', error);
    }
};

startServer();