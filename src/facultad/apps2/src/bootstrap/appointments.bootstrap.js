const { AppointmentsController } = require('@apps2/controllers/appointments.controller');
const { AppointmentsService } = require('@apps2/services/appointments.service');

function buildAppointmentsController() {
    const appointmentsService = new AppointmentsService(buildAppointmentsRepository());
    return new AppointmentsController(appointmentsService);
}

function buildAppointmentsRepository() {
    return buildMySqlRepository();
}

function buildMySqlRepository() {
    const { dbPool } = require('@apps2/configs/database.config');
    const { MySqlAppointmentsRepository } = require('@apps2/repositories/appointments.repository');
    return new MySqlAppointmentsRepository(dbPool);
}

module.exports = { buildAppointmentsController };