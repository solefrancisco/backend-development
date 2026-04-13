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
        res.status(403).json({
            error: 'Forbidden'
        });
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

    // Todo lo no montado por mountSubApp => 403
    app.use((req, res) => {
        if (req.originalUrl === '/favicon.ico') {
            return res.sendStatus(204);
        }

        return res.status(403).json({
            error: 'Forbidden'
        });
    });

    return app;
}

module.exports = { createCentralizerApp };