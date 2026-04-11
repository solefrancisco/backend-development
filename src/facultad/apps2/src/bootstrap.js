const { buildAppointmentsController } = require('@/bootstrap/appointments.bootstrap');
const { env } = require('@/configs/env.config');

function buildDependencies() {
    const dependencies = {};
    
    if (env.appointmentsEnabled) {
        dependencies.appointmentsController = buildAppointmentsController();
    }
    
    return dependencies;
}


module.exports = { buildDependencies };