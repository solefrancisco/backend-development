const { z } = require('zod');
const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

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
    .enum(['name', 'distance', 'first_availability'])
    .optional(),

  speciality_id: z
    .coerce.number({
      invalid_type_error: 'speciality_id must be a number'
    })
    .int('speciality_id must be an integer')
    .positive('speciality_id must be a positive integer')
    .optional(),

  since: z
    .string({ invalid_type_error: 'since must be a string' })
    .regex(dateTimeRegex, 'since must be YYYY-MM-DD HH:mm:ss')
    .optional(),

  until: z
    .string({ invalid_type_error: 'until must be a string' })
    .regex(dateTimeRegex, 'until must be YYYY-MM-DD HH:mm:ss')
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

  if (data.sort_by === 'first_availability') {
    if (!data.speciality_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'speciality_id is required when sort_by=first_availability'
      });
    }

    const hasSince = data.since !== undefined;
    const hasUntil = data.until !== undefined;


    if (hasSince !== hasUntil) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'since and until must be provided together'
      });
    } else if (hasSince && hasUntil) {
      const since = new Date(data.since.replace(' ', 'T'));
      const until = new Date(data.until.replace(' ', 'T'));

      if (since >= until) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'since must be before until',
          path: ['since'],
        });
      }

      const maxDate = new Date(since);
      maxDate.setMonth(maxDate.getMonth() + 1);

      if (until > maxDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'the difference between since and until must not be greater than 1 month',
          path: ['until'],
        });
      }
    }
  }
});

module.exports = { getMedicalCentersSchema };