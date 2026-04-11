const { env } = require('@/configs/env.config');
const { AppointmentsController } = require('@/controllers/appointments.controller');
const { AppointmentsService } = require('@/services/appointments.service');

function buildAppointmentsController() {
    const appointmentsService = new AppointmentsService(buildAppointmentsRepository());
    return new AppointmentsController(appointmentsService);
}

function buildAppointmentsRepository() {
    return buildMySqlRepository();
}

function buildMySqlRepository() {
    const { dbPool } = require('@/configs/database.config');
    const { MySqlAppointmentsRepository } = require('@/repositories/appointments.repository');
    return new MySqlAppointmentsRepository(dbPool);
}

module.exports = { buildAppointmentsController };