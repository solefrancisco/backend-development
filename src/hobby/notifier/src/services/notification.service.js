const { publishToQueue } = require('@notify/integrations/messaging/rabbit.publisher');
const { hashHmac, aesEncrypt, aesDecrypt } = require('@notify/utils/security.util');
const { InternalServerError } = require('@notify/errors/internal-server.error');
const { UnauthorizedError } = require('@notify/errors/unauthorized.error');
const { NotFoundError } = require('@notify/errors/not-found.error');
const { BadRequestError } = require('@notify/errors/bad-request.error');
const { paginationConfig } = require('@notify/configs/pagination.config');


class NotificationService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    async queueNotification(apiKey, requestId, data) {
        const hashed = hashHmac(apiKey);
        const apiKeyValidation = await this.notificationRepository.validateApiKey(hashed);

        if (!apiKeyValidation.success)
            throw new InternalServerError(`Database error during API key validation: ${apiKeyValidation.errorMessage}`);

        if (!apiKeyValidation.data)
            throw new UnauthorizedError('Invalid or inactive API key');

        const apiKeyOwner = apiKeyValidation.data.owner;
        const saveData = {
            apiKeyOwner,
            uuid: requestId,
            notified_by: data.notify_by,
            data: aesEncrypt(JSON.stringify(data))
        }
        const saveNotification = await this.notificationRepository.saveNotification(saveData);

        if (!saveNotification.success)
            throw new InternalServerError(`Failed to save notification: ${saveNotification.errorMessage}`);

        const queue = data.notify_by === 'email' ? 'notifications.email' : 'notifications.webhook';
        data.notification_sent_by = apiKeyOwner;
        data.request_id = requestId;

        await publishToQueue(queue, data);
        return { message: `Notification ${requestId} queued successfully` };
    }

    async getNotifications(query) {
        const quantity = await this.notificationRepository.count(query);
        if (!quantity.success)
            throw new InternalServerError(`Failed to get notifications: ${quantity.errorMessage}`);

        const totalItems = quantity.data;
        if (totalItems === 0)
            throw new NotFoundError(`No notifications found for the given criteria`);

        const defaultPageSize = paginationConfig.defaultPageSize;
        const totalPages = Math.ceil(totalItems / defaultPageSize);
        if (query.page > totalPages)
            throw new BadRequestError(`Page ${query.page} does not exist. Total pages: ${totalPages}`);

        const result = await this.notificationRepository.getNotifications(defaultPageSize, query);
        if (!result.success)
            throw new InternalServerError(`Failed to retrieve notifications: ${result.errorMessage}`);

        return {
            notifications: result.data,
            pagination: {
                total_notifications: totalItems,
                total_pages: totalPages,
                notifications_per_page: defaultPageSize
            }
        };
    }

    async getNotificationByUuid(uuid) {
        const response = await this.notificationRepository.findByUuid(uuid);
        
        if (!response.success)
            throw new InternalServerError('Failed to find notification: ' + response.errorMessage);

        if (!response.data)
            throw new NotFoundError(`Notification uuid ${uuid} not found`);

        response.data = {
            ...response.data,
            data: JSON.parse(aesDecrypt(response.data.data))
        };
        return response.data;
    }
}

module.exports = { NotificationService };