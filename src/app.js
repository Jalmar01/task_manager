const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const corsOptions = require('./config/cors');
const rateLimiter = require('./config/rate-limit');
const { serveUi, setupUi } = require('./config/swagger');
const requestId = require('./middlewares/request-id');

const userRoutes = require('./modules/users/user.routes');
const authRoutes = require('./modules/auth/auth.routes');
const taskRoutes = require('./modules/task/task.routes');
const healthRoutes = require('./modules/health/health.routes');

const app = express();

app.disable('x-powered-by');

// request id — first to capture every request
app.use(requestId);

// seguridad
app.use(helmet());

// logging estructurado
app.use(pinoHttp({
    logger,
    genReqId: (req) => req.requestId
}));

// rate limiting
app.use('/api/', rateLimiter);

// middleware para leer json
app.use(express.json());

app.use(cors(corsOptions));

// routes
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/health', healthRoutes);

// documentación interactiva
app.use('/api-docs', serveUi, setupUi);

// 🛡️ global error handler
app.use((err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';

    if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error:', err);
    }

    return res.status(status).json({
        error: message
    });
});

module.exports = app;
