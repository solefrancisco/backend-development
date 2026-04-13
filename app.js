require('module-alias/register');
const cors = require('cors');
const express = require('express');
const { appsConfig } = require('./src/configs/apps.config');
const { mountSubApp } = require('./src/loaders/apps.loader');

function createCentralizerApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.all('/', (req, res) => {
        res.sendStatus(403);
    });

    app.get('/health', (req, res) => {
        return res.status(200).json({
            status: 'ok',
            message: 'Centralizer is running'
        });
    });

    for (const appConfig of appsConfig) {
        mountSubApp(app, appConfig);
    }

    app.use((req, res) => {
        return res.status(404).json({
            error: 'Not found',
            message: `Route ${req.method} ${req.originalUrl} not found`
        });
    });

    return app;
}

module.exports = { createCentralizerApp };