require('dotenv').config();

const app = require('./app');
const { sequelize } = require('../database/connection');
const setupAssociations = require('../database/associations');

const PORT = process.env.PORT || 3000;
let server;

async function startServer() {
    try {
        await sequelize.authenticate();
        setupAssociations();
        console.log('✅ Database connected');

        server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed');
            try {
                await sequelize.close();
                console.log('Database connection closed');
                process.exit(0);
            } catch (err) {
                console.error('Error closing database:', err);
                process.exit(1);
            }
        });

        // Force exit after 10s
        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
