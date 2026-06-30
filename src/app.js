const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');

const setupAssociations = require('../database/associations');

const userRoutes = require('./modules/users/user.routes');
const authRoutes = require('./modules/auth/auth.routes');
const taskRoutes = require('./modules/task/task.routes');

const app = express();

app.disable('x-powered-by');

// middleware para leer json
app.use(express.json());

app.use(cors(corsOptions));

// 🔗 inicializar relaciones (CRÍTICO)
setupAssociations();

// routes
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

// 🛡️ global error handler
app.use((err, req, res, next) => {
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