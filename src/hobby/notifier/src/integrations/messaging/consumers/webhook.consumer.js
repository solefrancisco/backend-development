const { rabbitConfig } = require('@notify/configs/rabbitmq.config');
const { connectRabbit } = require('@notify/integrations/messaging/rabbit.client');
const { operatingRoomsClient: OperatingRoomsClient } = require('@notify/integrations/webhook/operating-rooms.client');

const operatingRoomsClient = new OperatingRoomsClient();

function isCoreEventsUrl(url) {
    try {
        const { pathname } = new URL(url);
        return pathname === '/events/log'
            || pathname.endsWith('/events/log')
            || pathname === '/api/events/webhook'
            || pathname.endsWith('/api/events/webhook');
    } catch (error) {
        return false;
    }
}

function parseJsonBodyIfPossible(body) {
    if (typeof body !== 'string') {
        return body;
    }

    try {
        return JSON.parse(body);
    } catch (error) {
        return body;
    }
}

function normalizeRequestBody(data) {
    const isCoreEventsRequest = isCoreEventsUrl(data.request.url);
    let bodyToSend = data.request.body;

    if (!isCoreEventsRequest) {
        bodyToSend = parseJsonBodyIfPossible(bodyToSend);
    }

    if (bodyToSend && typeof bodyToSend === 'object' && !Array.isArray(bodyToSend)) {
        bodyToSend = { ...bodyToSend };

        if (isCoreEventsRequest && bodyToSend.payload !== undefined && typeof bodyToSend.payload !== 'string') {
            bodyToSend.payload = JSON.stringify(bodyToSend.payload);
        }

        if (!isCoreEventsRequest) {
            bodyToSend.disclaimer = `Notificacion enviada por ${data.notification_sent_by} a traves de Notifier`;
        }
    }

    return bodyToSend;
}

function buildWebhookRequestOptions(data) {
    const method = data.request.method;
    const headers = { ...(data.request.headers || {}) };

    const requestOptions = {
        method,
        headers,
    };

    if (data.request.body !== undefined && !['GET', 'HEAD'].includes(method)) {
        const bodyToSend = normalizeRequestBody(data);

        requestOptions.body =
            typeof bodyToSend === 'string'
                ? bodyToSend
                : JSON.stringify(bodyToSend);

        const hasContentType =
            headers['Content-Type'] != null ||
            headers['content-type'] != null;

        if (!hasContentType && typeof bodyToSend !== 'string') {
            requestOptions.headers['Content-Type'] = 'application/json';
        }
    }

    return requestOptions;
}

async function processWebhookNotification(data) {
    const requestOptions = buildWebhookRequestOptions(data);

    try{
        console.log(`Sending webhook notification: ${JSON.stringify(requestOptions)}`);
        
        const response = await fetch(data.request.url, requestOptions);
        if (!response.ok) {
            console.error(`Webhook request failed with status ${response.status} for URL: ${data.request.url}`);
            const responseText = await response.text().catch(() => '');

            throw new Error(
                `Webhook request failed with status ${response.status}${responseText ? `: ${responseText}` : ''}`
            );
        } else {
            console.log(`Webhook notification sent successfully to URL: ${data.request.url}`);
        }
    } catch (error) {
        console.error(`Error sending webhook notification to URL: ${data.request.url} - ${error.message}`);
        throw error;
    }
}

function getRetryCount(message) {
    return Number(message.properties?.headers?.[rabbitConfig.retryHeader] ?? 0);
}

async function requeueMessage(channel, message, nextRetryCount) {
    const retryQueueMapper = {
        1: rabbitConfig.queues.webhook.retry1,
        2: rabbitConfig.queues.webhook.retry2,
        3: rabbitConfig.queues.webhook.retry3,
    }

    const targetQueue = nextRetryCount <= rabbitConfig.maxRetries
        ? retryQueueMapper[nextRetryCount]
        : rabbitConfig.queues.webhook.deadLetter;
    

    const sent = channel.sendToQueue(
        targetQueue,
        message.content,
        {
            persistent: true,
            contentType: message.properties.contentType || 'application/json',
            headers: {
                ...(message.properties.headers || {}),
                [rabbitConfig.retryHeader]: nextRetryCount,
            },
        }
    );

    if (!sent) {
        throw new Error('RabbitMQ write buffer is full while requeueing webhook notification');
    }
}

async function startWebhookConsumer() {
    const channel = await connectRabbit();

    await channel.assertQueue(rabbitConfig.queues.webhook.default, { durable: true });
    channel.prefetch(1);

    channel.consume(rabbitConfig.queues.webhook.default, async (message) => {
        if (!message) {
            return;
        }

        const retryCount = getRetryCount(message);

        try {
            const data = JSON.parse(message.content.toString());

            // If the payload is an internal event for surgery cancellation,
            // invoke the operating rooms client maintained here (notifier will call M6).
            if (data.event === 'SURGERY_CANCELLED' && data.appointmentId) {
                await operatingRoomsClient.cancelOperatingRoomReservation(
                    data.appointmentId,
                    data.reason || data.motive || ''
                );
            } else if (data.request) {
                // Generic webhook payload with `request` object - forward using generic fetch
                await processWebhookNotification(data);
            } else {
                throw new Error('Unsupported webhook payload: missing request or event handler');
            }

            channel.ack(message);
        } catch (error) {
            const nextRetryCount = retryCount + 1;

            try {
                await requeueMessage(channel, message, nextRetryCount);
                channel.ack(message);
            } catch (requeueError) {
                channel.nack(message, false, false);
            }
        }
    });
}

module.exports = {
    startWebhookConsumer,
    processWebhookNotification,
    buildWebhookRequestOptions,
    normalizeRequestBody,
};
