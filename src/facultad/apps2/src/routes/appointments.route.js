const { Router } = require('express');

const { validate } = require('@apps2/middlewares/validate.middleware');
const { createAppointmentSchema } = require('@apps2/schemas/create-appointment.schema');
const { getAppointmentsSchema } = require('@apps2/schemas/get-appointments.schema');
const { getAppointmentByIdSchema } = require('@apps2/schemas/get-appointment-by-id.schema');
const { confirmAppointmentByIdSchema } = require('@apps2/schemas/confirm-appointment-by-id.schema');
const { deleteAppointmentByIdSchema } = require('@apps2/schemas/delete-appointment-by-id.schema');
const { checkInAppointmentByIdSchema } = require('@apps2/schemas/check-in-appointment-by-id.schema');
const { rescheduleAppointmentByIdParamsSchema, rescheduleAppointmentByIdBodySchema} = require('@apps2/schemas/reschedule-appointment-by-id.schema');

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

    router.patch('/:id/confirm', 
        validate(confirmAppointmentByIdSchema, 'params'),
        (req, res, next) => appointmentsController.confirmAppointmentById(req, res, next)
    );

    router.delete('/:id', 
        validate(deleteAppointmentByIdSchema, 'params'),
        (req, res, next) => appointmentsController.deleteAppointmentById(req, res, next)
    );

    router.patch('/:id/check-in', 
        validate(checkInAppointmentByIdSchema, 'params'),
        (req, res, next) => appointmentsController.checkInAppointmentById(req, res, next)
    );

    router.patch('/:id/reschedule',
        validate (rescheduleAppointmentByIdParamsSchema, 'params'),
        validate (rescheduleAppointmentByIdBodySchema, 'body'),
        (req, res, next) => appointmentsController.rescheduleAppointmentById(req, res, next) 
    );

    return router;
}

module.exports = { AppointmentsRouter };