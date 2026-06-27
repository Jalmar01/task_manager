const express = require('express');
const cors = require('cors');

const setupAssociations = require('../database/associations');

const userRoutes = require('./modules/users/user.routes');
const authRoutes = require('./modules/auth/auth.routes');
const taskRoutes = require('./modules/task/task.routes');

const app = express();

app.disable('x-powered-by');

// middlewore para leer json
app.use(express.json());


app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

// 🔗 inicializar relaciones (CRÍTICO)
setupAssociations();

// routes
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

module.exports = app;