const { BadRequestError } = require('@apps2/errors/bad-request.error');
const { NotFoundError } = require('@apps2/errors/not-found.error');
const { InternalServerError } = require('@apps2/errors/internal-server.error');
const { ConflictError } = require('@apps2/errors/conflict.error');
const { paginationConfig } = require('@apps2/configs/pagination.config');
const { mockConfig } = require('@apps2/configs/mock.config');

class AppointmentsService {
    constructor(appointmentsRepository, appointmentsUtils, specialitiesService) {
        this.appointmentsRepository = appointmentsRepository;
        this.appointmentsUtils = appointmentsUtils;

        // just for mocking purposes, to avoid circular dependencies
        this.specialitiesService = specialitiesService;
    }

    async createAppointment(data) {
        const result = await this.appointmentsRepository.create(data);
        if (!result.success)
            if (['45400', '45410', '45420', '45430'].includes(result.sqlState))
                throw new ConflictError('Scheduling conflict: ' + result.errorMessage);

            throw new InternalServerError('Failed to create appointment: ' + result.errorMessage);
        
        return { appointment_id: result.data };
    }

    async findOccupiedAppointments(query) {
        const result = await this.appointmentsRepository.findOccupiedAppointments(query);
        if (!result.success)
            throw new InternalServerError('Failed to retrieve occupied appointments: ' + result.errorMessage);
    
        return {
            appointments: result.data,
        }
    }

    async getAppointments(query) {
        const quantity = await this.appointmentsRepository.count(query);
        if (!quantity.success)
            throw new InternalServerError('Failed to paginate appointments: ' + quantity.errorMessage);

        const totalItems = quantity.data;
        if (totalItems === 0)
            throw new NotFoundError('No appointments found for the given criteria');

        const defaultPageSize = paginationConfig.defaultPageSize;
        const totalPages = Math.ceil(totalItems / defaultPageSize);
        if (query.page > totalPages)
            throw new BadRequestError(`Page ${query.page} does not exist. Total pages: ${totalPages}`);

        let result = await this.appointmentsRepository.findAll(defaultPageSize, query);
        if (!result.success)
            throw new InternalServerError('Failed to retrieve appointments: ' + result.errorMessage);

        if (mockConfig.enabled) {
            result = await this.mockData(result);
        }

        return {
            appointments: result.data,
            pagination: {
                total_appointments: totalItems,
                total_pages: totalPages,
                appointments_per_page: defaultPageSize
            }
        };
    }

    async getAppointmentById(id) {
        let response = await this.appointmentsRepository.findById(id);
        
        if (!response.success)
            throw new InternalServerError('Failed to find appointment: ' + response.errorMessage);

        if (!response.data)
            throw new NotFoundError(`Appointment id ${id} not found`);
        
        if (mockConfig.enabled) {
            const result = { data: [response.data] }; // adapt to mockData format
            response = await this.mockData(result);
        }

        return response.data;
    }

    async confirmAppointment(id) {
        const result = await this.appointmentsRepository.confirm(id);
        return await this.validateAppointmentUpdate(id, result, 'confirmed');
    }

    async checkInAppointment(id) {
        const result = await this.appointmentsRepository.checkIn(id);
        return await this.validateAppointmentUpdate(id, result, 'checked-in');
    }

    async cancelAppointment(id) {
        const result = await this.appointmentsRepository.cancel(id);
        return await this.validateAppointmentUpdate(id, result, 'cancelled');
    }

    async rescheduleAppointment(id, data) {
        const result = await this.appointmentsRepository.reschedule(id, data);
        return await this.validateAppointmentUpdate(id, result, 'rescheduled');
    }

    async validateAppointmentUpdate(id, result, action) {
        if (!result.success)
            throw new InternalServerError ('Failed to perform operation on appointment: ' + result.sqlState);

        if (!result.data.affectedRows) {
            const found = await this.getAppointmentById(id);
            throw new BadRequestError(`Appointment cannot be updated due to its current state`);
        }

        return { message: `The appointment was ${action} successfully` };
    }

    async searchAppointments(query) {
        if (query.only_occupied)
            return await this.findOccupiedAppointments(query);

        return await this.getAppointments(query);
    }

    async mockData(result) {
        const mockedUsers = await this.appointmentsRepository.findMockedUsers();
        if (!mockedUsers.success)
            throw new InternalServerError('Failed to retrieve mocked users: ' + mockedUsers.errorMessage);

        for (const appointment of result.data) {
            const randomPatient = this.appointmentsUtils.getRandomItem(mockedUsers.data);
            const randomMedic = this.appointmentsUtils.getRandomItem(mockedUsers.data);
            
            appointment.patient = {
                id: appointment.patient_id,
                fullname: randomPatient.fullname,
                email: randomPatient.email
            };
            appointment.medic = {
                id: appointment.medic_id,
                fullname: randomMedic.fullname,
                email: randomMedic.email
            };

            delete appointment.medic_id;
            delete appointment.patient_id;

            const specialityResponse = await this.specialitiesService.getSpecialityById(appointment.speciality_id);
            appointment.speciality = specialityResponse;
            delete appointment.speciality_id;
        }

        return result;
    }
}

module.exports = { AppointmentsService };