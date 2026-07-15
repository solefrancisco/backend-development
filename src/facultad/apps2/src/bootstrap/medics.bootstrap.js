const { MedicsController } = require('@apps2/controllers/medics.controller');
const { MedicsService } = require('@apps2/services/medics.service');

function buildMedicsController(coreClient) {
    const medicsService = new MedicsService(buildMedicsRepository(), coreClient);
    startMedicsCacheRefresh(medicsService);

    return new MedicsController(medicsService);
}

function buildMedicsRepository() {
    const { dbPool } = require('@apps2/configs/database.config');
    const { MySqlMedicsRepository } = require('@apps2/repositories/medics.repository');
    return new MySqlMedicsRepository(dbPool);
}

function startMedicsCacheRefresh(medicsService) {
    medicsService.refreshMedicsCache().catch((error) => {
        console.error('Failed to refresh medics cache', error);
    });
}

module.exports = { buildMedicsController };
