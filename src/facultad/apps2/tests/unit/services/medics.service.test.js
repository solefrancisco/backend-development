const test = require('node:test');
const assert = require('node:assert/strict');

const { MedicsService } = require('@apps2/services/medics.service');

function createCoreUser(id, firstName = 'Mateo001', lastName = 'SanchezMedico001') {
    return {
        id,
        first_name: firstName,
        last_name: lastName,
        email: `medic${id}@example.com`,
        specialities: [
            {
                id: 1,
                name: 'Cardiologia',
            },
        ],
    };
}

test('refreshMedicsCache reads ids from repository and hydrates them from Core', async () => {
    const requestedIds = [];
    const service = new MedicsService({
        async findAllIds() {
            return {
                success: true,
                data: [{ medic_id: 85 }, { medic_id: 86 }],
            };
        },
    }, {
        async getAccessToken() {
            return 'core-token';
        },
        async getUserById(id) {
            requestedIds.push(id);
            return {
                success: true,
                status: 200,
                data: createCoreUser(id),
            };
        },
    });

    const medics = await service.refreshMedicsCache();

    assert.deepEqual(requestedIds.sort((a, b) => a - b), [85, 86]);
    assert.deepEqual(medics, [
        {
            medic_id: 85,
            fullname: 'Mateo Sanchez',
            email: 'medic85@example.com',
            speciality_id: 1,
            speciality_name: 'Cardiologia',
        },
        {
            medic_id: 86,
            fullname: 'Mateo Sanchez',
            email: 'medic86@example.com',
            speciality_id: 1,
            speciality_name: 'Cardiologia',
        },
    ]);
});

test('getMedics returns hydrated cache and filters by speciality_id', async () => {
    const service = new MedicsService({}, null);
    service.medicsCache = [
        {
            medic_id: 85,
            fullname: 'Mateo Sanchez',
            email: 'medic85@example.com',
            speciality_id: 1,
            speciality_name: 'Cardiologia',
        },
        {
            medic_id: 214,
            fullname: 'Valentina Molina',
            email: 'medic214@example.com',
            speciality_id: 67,
            speciality_name: 'Cirugia Ginecologica',
        },
    ];

    assert.deepEqual(await service.getMedics({ speciality_id: 67 }), [service.medicsCache[1]]);
    assert.deepEqual(await service.getMedics(), service.medicsCache);
});

test('createMedic saves only id and hydrates only the new medic from Core', async () => {
    const savedIds = [];
    const requestedIds = [];
    const service = new MedicsService({
        async saveId(medicId) {
            savedIds.push(medicId);
            return { success: true, data: { medic_id: medicId } };
        },
    }, {
        async getUserById(id) {
            requestedIds.push(id);
            return {
                success: true,
                status: 200,
                data: createCoreUser(id, 'Valentina130', 'MolinaMedico130'),
            };
        },
    });
    service.medicsCache = [
        {
            medic_id: 85,
            fullname: 'Mateo Sanchez',
            email: 'medic85@example.com',
            speciality_id: 1,
            speciality_name: 'Cardiologia',
        },
    ];

    const medic = await service.createMedic({ medic_id: 214 });

    assert.deepEqual(savedIds, [214]);
    assert.deepEqual(requestedIds, [214]);
    assert.deepEqual(medic, {
        medic_id: 214,
        fullname: 'Valentina Molina',
        email: 'medic214@example.com',
        speciality_id: 1,
        speciality_name: 'Cardiologia',
    });
    assert.deepEqual(service.medicsCache.map(item => item.medic_id), [85, 214]);
});
