class AppointmentsController {
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }

    async createAppointment(req, res, next) {
        try {
            const data = req.body;
            const appointment = await this.appointmentsService.createAppointment(data);

            res.status(201).json(appointment);
        } catch (error) {
            next(error);
        }   
    }

    async getAppointments(req, res, next) {
        try {
            const query = req.query;
            const appointments = await this.appointmentsService.getAppointments(query);
            
            res.status(200).json(appointments);
        } catch (error) {
            next(error);
        }
    }

    async getAppointmentById(req, res, next) {
        try {
            const { id } = req.params;
            const appointment = await this.appointmentsService.getAppointmentById(id);
            
            return res.status(200).json(appointment);
        } catch (error) {
            next(error);
        }
    }

    async confirmAppointmentById(req, res, next) {
        try {
            const { id } = req.params;
            const appointment = await this.appointmentsService.confirmAppointment(id);

            return res.status(200).json(appointment);
        } catch (error) {
            next(error);
        }
    }

    async deleteAppointmentById(req, res, next) {
        try {
            const { id } = req.params;
            const appointment = await this.appointmentsService.cancelAppointment(id);

            return res.status(200).json(appointment);
        } catch (error) {
            next(error);
        }
    }

    async checkInAppointmentById(req, res, next) {
        try {
            const { id } = req.params;
            const appointment = await this.appointmentsService.checkInAppointment(id);

            return res.status(200).json(appointment);
        } catch (error) {
            next(error);
        }
    }

    async rescheduleAppointmentById(req, res, next) {
        try {
            const {id} = req.params;
            const {starts_at} = req.body;
            const {ends_at} = req.body;
            const appointment = await this.appointmentsService.rescheduleAppointment(id, starts_at, ends_at);

            return res.status(200).json(appointment);
        } catch (error){
            next(error);
        }
    }

}

module.exports = { AppointmentsController };