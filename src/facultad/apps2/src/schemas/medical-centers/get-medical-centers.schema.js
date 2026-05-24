const { z } = require('zod');

const getMedicalCentersSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'name must be a string'
    })
    .trim()
    .min(1, 'name cannot be empty')
    .optional(),

  city: z
    .string({
      invalid_type_error: 'city must be a string'
    })
    .trim()
    .min(1, 'city cannot be empty')
    .optional(),

  lat: z
    .coerce.number({
      invalid_type_error: 'lat must be a number'
    })
    .finite('lat must be a valid number')
    .min(-90, 'lat must be greater than or equal to -90')
    .max(90, 'lat must be less than or equal to 90')
    .optional(),

  lng: z
    .coerce.number({
      invalid_type_error: 'lng must be a number'
    })
    .finite('lng must be a valid number')
    .min(-180, 'lng must be greater than or equal to -180')
    .max(180, 'lng must be less than or equal to 180')
    .optional(),

  page: z
    .coerce.number({
      invalid_type_error: 'page must be a number'
    })
    .int('page must be an integer')
    .positive('page must be a positive integer')
    .default(1)

}).strict();

module.exports = { getMedicalCentersSchema };