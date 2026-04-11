require('module-alias/register');
const cors = require('cors');
const express = require('express');
const { httpLogger } = require('@apps2/middlewares/http-logger.middleware');
const { errorHandler } = require('@apps2/middlewares/error-handler.middleware');
const { AppointmentsRouter } = require('@apps2/routes/appointments.route');

function createApp(dependencies) {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(httpLogger);

    bootstrapAppControllers(app, dependencies);

    app.use((req, res) => {
        return res.status(404).json({
            error: 'Not found',
            message: `Route ${req.method} ${req.originalUrl} not found`
        });
    });

    app.use(errorHandler);

    return app;
}

function bootstrapAppControllers(app, dependencies) {
    if (dependencies.appointmentsController) {
        app.use(
            '/api/v1/appointments', 
            AppointmentsRouter(dependencies.appointmentsController)
        );
    }
}

module.exports = { createApp };