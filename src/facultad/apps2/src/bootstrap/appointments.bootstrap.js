const { AppointmentsController } = require('@apps2/controllers/appointments.controller');
const { AppointmentsService } = require('@apps2/services/appointments.service');
const { AppointmentsUtils } = require('@apps2/utils/appointments.utils');
const { mockConfig } = require('@apps2/configs/mock.config');

// just for mocking purposes, to avoid circular dependencies
function mockRequiredDependencies() {
    if (mockConfig.enabled) {
        const { buildSpecialitiesController } = require('@apps2/bootstrap/specialities.bootstrap');
        return { specialitiesService: buildSpecialitiesController().specialitiesService };
    } 
    return {};
}

function buildAppointmentsController() {
    const appointmentsService = new AppointmentsService(buildAppointmentsRepository(), new AppointmentsUtils(), mockRequiredDependencies().specialitiesService);
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