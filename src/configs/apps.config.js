const env = require('./env.config');

const { createApp: createApps2App } = require('@apps2App/app');
const { buildDependencies: buildApps2Dependencies } = require('@apps2/bootstrap');

const appsConfig = [
  {
    appName: 'apps2',
    enabled: env.apps2Enabled,
    mountPath: '/apps2',
    buildDependencies: buildApps2Dependencies,
    createApp: createApps2App
  }
];

module.exports = { appsConfig };