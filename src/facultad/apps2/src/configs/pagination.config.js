const { env } = require('./env.config');

const paginationConfig = {
    defaultPage: 1,
    defaultPageSize: Number(env.paginationDefaultPageSize),
}

module.exports = { paginationConfig };