const { Router } = require('express');

const { validate } = require('@apps2/middlewares/validate.middleware');
const { createAppointmentSchema } = require('@apps2/schemas/create-appointment.schema');
const { getAppointmentsSchema } = require('@apps2/schemas/get-appointments.schema');
const { getAppointmentByIdSchema } = require('@apps2/schemas/get-appointment-by-id.schema');
const { patchAppointmentByIdConfirmSchema } = require('@apps2/schemas/patch-appointment-by-id-confirm.schema');
const { deleteAppointmentByIdCancelSchema } = require('@apps2/schemas/delete-appointment-by-id-cancel.schema');
const { patchAppointmentByIdCheckInSchema } = require('@apps2/schemas/patch-appointment-by-id-check-in.schema');
const { patchAppointmentByIdRescheduleParamsSchema, patchAppointmentByIdRescheduleBodySchema} = require('@apps2/schemas/patch-appointment-by-id-reschedule.schema');

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
        validate(patchAppointmentByIdConfirmSchema, 'params'),
        (req, res, next) => appointmentsController.patchAppointmentByIdConfirm(req, res, next)
    );

    router.delete('/:id/cancel', 
        validate(deleteAppointmentByIdCancelSchema, 'params'),
        (req, res, next) => appointmentsController.deleteAppointmentByIdCancel(req, res, next)
    );

    router.patch('/:id/check-in', 
        validate(patchAppointmentByIdCheckInSchema, 'params'),
        (req, res, next) => appointmentsController.patchAppointmentByIdCheckIn(req, res, next)
    );

    router.patch('/:id/reschedule',
        validate (patchAppointmentByIdRescheduleParamsSchema, 'params'),
        validate (patchAppointmentByIdRescheduleBodySchema, 'body'),
        (req, res, next) => appointmentsController.patchAppointmentByIdReschedule(req, res, next) 
    );

    return router;
}

module.exports = { AppointmentsRouter };