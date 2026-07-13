const express = require('express');
const router = express.Router();
const sequelize = require('../../../database/connection');

router.get('/', async (_req, res) => {
    const start = Date.now();

    let dbStatus = 'connected';
    try {
        await sequelize.authenticate();
    } catch {
        dbStatus = 'error';
    }

    const responseTime = Date.now() - start;

    const statusCode = dbStatus === 'connected' ? 200 : 503;

    return res.status(statusCode).json({
        status: statusCode === 200 ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        responseTimeMs: responseTime,
        database: dbStatus
    });
});

module.exports = router;
