const { NotificationsClient } = require('@apps2/integrations/notifications/notifications.client');
const { NotificationsAdapter } = require('@apps2/integrations/notifications/notifications.adapter');
const { integrationConfig } = require('@apps2/configs/integration.config');

function buildNotificationsClient() {
    if (!integrationConfig.notificationsEnabled) {
        return {};
    }

    return new NotificationsClient(
        integrationConfig.notificationsBaseUrl,
        integrationConfig.notificationsApiKey,
        buildNotificationsAdapter()
    );
}

function buildNotificationsAdapter() {
    return new NotificationsAdapter();
}

module.exports = { buildNotificationsClient };