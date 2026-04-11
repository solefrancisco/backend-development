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
    dbEnabled: getBoolean('DB_ENABLED'),
    dbHost: getRequired('DB_HOST'),
    dbPort: Number(process.env.DB_PORT),
    dbUser: getRequired('DB_USER'),
    dbPassword: getRequired('DB_PASSWORD'),
    dbName: getRequired('DB_NAME'),
    dbConnectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
    dbQueueLimit: Number(process.env.DB_QUEUE_LIMIT),
    dbWaitForConnections: getBoolean('DB_WAIT_FOR_CONNECTIONS'),

    // PAGINATION
    paginationDefaultPageSize: Number(process.env.PAGINATION_DEFAULT_PAGE_SIZE),
    
    // MODULES
    appointmentsEnabled: getBoolean('APPOINTMENTS_ENABLED')
  }
};