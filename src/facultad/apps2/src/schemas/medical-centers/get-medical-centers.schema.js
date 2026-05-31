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

  sort_by: z
    .enum(['name', 'distance'])
    .optional(),

  page: z
    .coerce.number({
      invalid_type_error: 'page must be a number'
    })
    .int('page must be an integer')
    .positive('page must be a positive integer')
    .default(1)

}).strict().superRefine((data, ctx) => {
  const hasLat = data.lat !== undefined;
  const hasLng = data.lng !== undefined;

  if (hasLat !== hasLng) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'lat and lng must be provided together'
    });
  }

  if (data.sort_by === 'distance' && (!hasLat || !hasLng)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'lat and lng are required when sort_by=distance'
    });
  }
});

module.exports = { getMedicalCentersSchema };