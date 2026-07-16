const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildWebhookRequestOptions,
} = require('@notify/integrations/messaging/consumers/webhook.consumer');

test('buildWebhookRequestOptions sends parsed object body to generic webhooks', () => {
  const options = buildWebhookRequestOptions({
    notification_sent_by: 'APPS 2 - Modulo 2',
    request: {
      url: 'https://example.com/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Turno de alta complejidad cancelado',
        appointment: { id: 22 },
      }),
    },
  });

  assert.equal(options.method, 'POST');
  assert.equal(typeof options.body, 'string');
  assert.deepEqual(JSON.parse(options.body), {
    reason: 'Turno de alta complejidad cancelado',
    appointment: { id: 22 },
    disclaimer: 'Notificacion enviada por APPS 2 - Modulo 2 a traves de Notifier',
  });
});

test('buildWebhookRequestOptions stringifies only payload when sending to Core event bus', () => {
  const options = buildWebhookRequestOptions({
    notification_sent_by: 'APPS 2 - Modulo 2',
    request: {
      url: 'https://gw.healthcare.cantero.ar/api/events/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        event_type_id: 123,
        publisher_module: 'APPS2',
        payload: {
          appointment_id: 22,
          reason: 'Turno de alta complejidad cancelado',
        },
      },
    },
  });

  assert.deepEqual(JSON.parse(options.body), {
    event_type_id: 123,
    publisher_module: 'APPS2',
    payload: JSON.stringify({
      appointment_id: 22,
      reason: 'Turno de alta complejidad cancelado',
    }),
  });
});
