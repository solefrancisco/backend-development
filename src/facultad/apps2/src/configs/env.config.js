const dotenv = require('dotenv');

dotenv.config();

function getRequired(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getBoolean(name) {
  const rawValue = process.env[name];

  if (rawValue == null) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  const normalizedValue = rawValue.trim().toLowerCase();
  // required since when using Boolean() on a non-empty string it will always return true, even for "false"
  if (normalizedValue === 'true') {
    return true;
  }

  if (normalizedValue === 'false') {
    return false;
  }

  throw new Error(`Environment variable ${name} must be "true" or "false"`);
}

module.exports = {
  env: {
    // APP
    port: Number(process.env.PORT),

    // DATABASE
    dbEnabled: getBoolean('APPS2_DB_ENABLED'),
    dbHost: getRequired('APPS2_DB_HOST'),
    dbPort: Number(process.env.APPS2_DB_PORT),
    dbUser: getRequired('APPS2_DB_USER'),
    dbPassword: getRequired('APPS2_DB_PASSWORD'),
    dbName: getRequired('APPS2_DB_NAME'),
    dbConnectionLimit: Number(process.env.APPS2_DB_CONNECTION_LIMIT),
    dbQueueLimit: Number(process.env.APPS2_DB_QUEUE_LIMIT),
    dbWaitForConnections: getBoolean('APPS2_DB_WAIT_FOR_CONNECTIONS'),

    // PAGINATION
    paginationDefaultPageSize: Number(process.env.APPS2_PAGINATION_DEFAULT_PAGE_SIZE),
    
    // MODULES
    appointmentsEnabled: getBoolean('APPS2_APPOINTMENTS_ENABLED'),
    specialitiesEnabled: getBoolean('APPS2_SPECIALITIES_ENABLED')
  }
};