const { InternalServerError } = require('@apps2/errors/internal-server.error');

class MedicsService {
    constructor(medicsRepository, coreClient) {
        this.medicsRepository = medicsRepository;
        this.coreClient = coreClient;
        this.medicsCache = [];
        this.refreshPromise = null;
    }

    async getMedics(query = {}) {
        if (this.refreshPromise) {
            await this.refreshPromise;
        }

        return query.speciality_id
            ? this.medicsCache.filter((medic) => medic.speciality_id === query.speciality_id)
            : this.medicsCache;
    }

    async createMedic(data) {
        if (this.refreshPromise) {
            await this.refreshPromise;
        }

        const result = await this.medicsRepository.saveId(data.medic_id);
        if (!result.success) {
            throw new InternalServerError('Failed to save cached medic id: ' + result.errorMessage);
        }

        const medic = await this.getMedicFromCore(data.medic_id);
        this.upsertMedicInCache(medic);

        return medic;
    }

    async refreshMedicsCache() {
        this.refreshPromise = this.loadMedicsCache();

        try {
            return await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }

    async loadMedicsCache() {
        const result = await this.medicsRepository.findAllIds();
        if (!result.success) {
            throw new InternalServerError('Failed to retrieve cached medic ids: ' + result.errorMessage);
        }

        if (this.coreClient && typeof this.coreClient.getAccessToken === 'function') {
            await this.coreClient.getAccessToken();
        }

        const responses = await Promise.allSettled(
            result.data.map((medic) => this.getMedicFromCore(medic.medic_id))
        );
        const medics = responses
            .filter((response) => response.status === 'fulfilled' && response.value)
            .map((response) => response.value);

        this.medicsCache = medics;
        console.log(`[MEDICS] Cache refreshed with ${medics.length}/${result.data.length} medics`);

        responses
            .filter((response) => response.status === 'rejected')
            .forEach((response) => console.warn('[MEDICS] Failed to hydrate cached medic from Core', response.reason));

        return this.medicsCache;
    }

    async getMedicFromCore(medicId) {
        if (!this.coreClient) {
            throw new InternalServerError('Core client is required to hydrate cached medics');
        }

        const response = await this.coreClient.getUserById(medicId);
        if (!response.success) {
            throw new InternalServerError(`Failed to retrieve medic ${medicId} from Core. Status: ${response.status}`);
        }

        if (!this.isValidCoreUser(response.data)) {
            throw new InternalServerError(`Core medic ${medicId} response is invalid`);
        }

        return this.mapCoreUserToMedic(response.data);
    }

    isValidCoreUser(user) {
        return Boolean(user && typeof user === 'object' && user.id && user.email);
    }

    mapCoreUserToMedic(user) {
        const speciality = Array.isArray(user.specialities) ? user.specialities[0] : null;

        return {
            medic_id: user.id,
            fullname: this.normalizeFullname([user.first_name, user.last_name].filter(Boolean).join(' ')),
            email: user.email,
            speciality_id: speciality ? speciality.id : null,
            speciality_name: speciality ? speciality.name : null,
        };
    }

    normalizeFullname(fullname) {
        return String(fullname)
            .replace(/\d+/g, '')
            .replace(/Medico/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    upsertMedicInCache(medic) {
        const index = this.medicsCache.findIndex((cachedMedic) => cachedMedic.medic_id === medic.medic_id);

        if (index >= 0) {
            this.medicsCache[index] = medic;
            return;
        }

        this.medicsCache.push(medic);
        this.medicsCache.sort((a, b) => a.medic_id - b.medic_id);
    }
}

module.exports = { MedicsService };
