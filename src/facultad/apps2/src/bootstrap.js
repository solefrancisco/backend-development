const { buildAppointmentsController } = require('@apps2/bootstrap/appointments.bootstrap');
const { buildSpecialitiesController } = require('@apps2/bootstrap/specialities.bootstrap');
const { env } = require('@apps2/configs/env.config');

function buildDependencies() {
    const dependencies = {};
    
    if (env.appointmentsEnabled) {
        dependencies.appointmentsController = buildAppointmentsController();
    }

    if (env.specialitiesEnabled) {
        dependencies.specialitiesController = buildSpecialitiesController();
    }
    
    return dependencies;
}


module.exports = { buildDependencies };