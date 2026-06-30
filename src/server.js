require('dotenv').config();

const app = require('./app');
const { sequelize } = require('../database/connection');

const PORT = process.env.PORT || 3000;

async function startServer(){
    try{
        await sequelize.authenticate();
        console.log('✅ Database connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`)
        })
    }catch(error){
        console.error('❌ Error starting server:', error);
    }
};

startServer();