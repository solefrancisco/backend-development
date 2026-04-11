const { Router } = require('express');
const { validate } = require('@apps2/middlewares/validate.middleware');
const { createAppointmentSchema } = require('@apps2/schemas/create-appointment.schema');
const { getAppointmentsSchema } = require('@apps2/schemas/get-appointments.schema');
const { getAppointmentByIdSchema } = require('@apps2/schemas/get-appointment-by-id.schema');

function AppointmentsRouter(appointmentsController) {
    const router = Router();

    router.post(
        '/',
        validate(createAppointmentSchema, 'body'),
        (req, res, next) => appointmentsController.createAppointment(req, res, next)
    );

    router.get('/', 
        validate(getAppointmentsSchema, 'query'),
        (req, res, next) => appointmentsController.getAppointments(req, res, next)
    );

    router.get('/:id', 
        validate(getAppointmentByIdSchema, 'params'),
        (req, res, next) => appointmentsController.getAppointmentById(req, res, next)
    );

    return router;
}

module.exports = { AppointmentsRouter };