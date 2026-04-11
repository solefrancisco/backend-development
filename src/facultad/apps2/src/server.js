require('module-alias/register');
const { createApp } = require('../app');
const { buildDependencies } = require('@/bootstrap');
const { env } = require('@/configs/env.config');

if (!env.dbEnabled) {
    console.warn('Database is disabled. Finishing server startup.');
    process.exit(0);
}

const dependencies = buildDependencies();
const app = createApp(dependencies);

const port = env.port || 3000;

app.listen(port);