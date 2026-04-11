const { z } = require('zod');

const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const createAppointmentSchema = z.object({
  medic_id: z
    .number({ required_error: 'medic_id is required', invalid_type_error: 'medic_id must be a number' })
    .int('medic_id must be an integer')
    .positive('medic_id must be greater than 0'),

  patient_id: z
    .number({ required_error: 'patient_id is required', invalid_type_error: 'patient_id must be a number' })
    .int('patient_id must be an integer')
    .positive('patient_id must be greater than 0'),

  center_id: z
    .number({ required_error: 'center_id is required', invalid_type_error: 'center_id must be a number' })
    .int('center_id must be an integer')
    .positive('center_id must be greater than 0'),

  speciality_id: z
    .number({ required_error: 'speciality_id is required', invalid_type_error: 'speciality_id must be a number' })
    .int('speciality_id must be an integer')
    .positive('speciality_id must be greater than 0'),

  starts_at: z
    .string({ required_error: 'starts_at is required', invalid_type_error: 'starts_at must be a string' })
    .regex(dateTimeRegex, 'starts_at must be YYYY-MM-DD HH:mm:ss'),

  ends_at: z
    .string({ required_error: 'ends_at is required', invalid_type_error: 'ends_at must be a string' })
    .regex(dateTimeRegex, 'ends_at must be YYYY-MM-DD HH:mm:ss')
}).refine(
  (data) => new Date(data.starts_at.replace(' ', 'T')) < new Date(data.ends_at.replace(' ', 'T')),
  {
    message: 'starts_at must be before ends_at',
    path: ['starts_at'],
  }
);

module.exports = { createAppointmentSchema };