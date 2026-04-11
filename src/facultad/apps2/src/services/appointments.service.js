const { BadRequestError } = require('@apps2/errors/bad-request-error');
const { NotFoundError } = require('@apps2/errors/not-found-error');
const { InternalServerError } = require('@apps2/errors/internal-server-error');
const { paginationConfig } = require('@apps2/configs/pagination.config');

class AppointmentsService {
    constructor(appointmentsRepository) {
        this.appointmentsRepository = appointmentsRepository;
    }

    async createAppointment(data) {
        const now = new Date();
        if (new Date(data.starts_at) < now) {
            throw new BadRequestError('Cannot create appointment in the past');
        }

        const result = await this.appointmentsRepository.create(data);
        if (!result.success) {
            if (result.sqlState === '45000') {
                throw new BadRequestError('Scheduling conflict: Medic, patient, or center is not available at the requested time');
            }

            throw new InternalServerError('Failed to create appointment: ' + result.sqlState);
        }
        
        return { appointment_id: result.data };
    }

    async getAppointments(query) {
        const result = await this.appointmentsRepository.findAll(paginationConfig.defaultPageSize, query);
        
        if (!result.success) {
            throw new InternalServerError('Failed to retrieve appointments: ' + result.sqlState);
        }
        
        return result.data;
    }

    async getAppointmentById(id) {
        const response = await this.appointmentsRepository.findById(id);
        
        if (!response.success) {
            throw new InternalServerError('Failed to find appointment: ' + response.sqlState);
        }

        if (!response.data) {
            throw new NotFoundError(`Appointment id ${id} not found`);
        }
        
        return response.data;
    }

}

module.exports = { AppointmentsService };