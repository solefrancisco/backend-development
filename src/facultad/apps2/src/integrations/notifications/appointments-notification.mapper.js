function getFormattedTimestamp(){
    const date = new Date();

    // UTC-3
    date.setHours(date.getHours() - 3);

    return date.toISOString().slice(0, 19).replace('T', ' ');
}

function getDefaultNotificationTemplate(data, appointmentId, notificationTemplate) {
    const notificationData = data.data || data; // Handle both cases where data is nested under 'data' or is the root object

    return {
        notify_by: 'email',
        notification_type: notificationTemplate,
        appointment: {
            id: appointmentId,
            starts_at: notificationData.appointment.starts_at,
            speciality_name: notificationData.appointment.speciality_name,
            medical_center_name: notificationData.appointment.medical_center_name,
        },
        patient: {
            fullname: notificationData.patient.fullname,
            email: notificationData.patient.email,
        },
        medic: {
            fullname: notificationData.medic.fullname,
            email: notificationData.medic.email,
        }
    };
}

function getDefaultWebhookNotificationTemplate(data, appointmentId, notificationTemplate, url, reason, requestId) {
    const notificationData = data.data || data;
    console.log(`${requestId} - Webhook notification target URL:`, url);
    return {
        notify_by: 'webhook',
        request: {
            url: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                reason: reason
            }
        }
    };
}

function generateCreateAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    return notification;
}

function generateRescheduleAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    notification.appointment.original_starts_at = data.data.appointment.starts_at;

    return notification
}

function generateCancelAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    notification.appointment.cancelled_at = getFormattedTimestamp();

    return notification;
}

function generateConfirmAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    notification.appointment.confirmed_at = getFormattedTimestamp();

    return notification;
}

function generateCheckInAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    notification.appointment.checked_in_at = getFormattedTimestamp();

    return notification;
}

function generateFinishAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    notification.appointment.finished_at = getFormattedTimestamp();

    return notification;
}

function generateExpiredAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    notification.appointment.expired_at = getFormattedTimestamp();

    return notification;
}

function generateReminderAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    return notification;
}

function generateAbsentAppointmentNotification(data, appointmentId, notificationTemplate) {
    const notification = getDefaultNotificationTemplate(data, appointmentId, notificationTemplate);
    return notification;
}

function generateOperationsRoomWebhookNotification(data, appointmentId, notificationTemplate, reason, requestId) {
    const url = process.env.OPERATING_ROOM_WEBHOOK_URL || 'https://api.quirofano-externo.com/v1/webhook';
    const notificationOriginalData = data.data;
    const notification = getDefaultWebhookNotificationTemplate(notificationOriginalData, appointmentId, notificationTemplate, url, reason, requestId);
    
    notification.request.body.appointment = {
        id: appointmentId,
        starts_at: notificationOriginalData.appointment.starts_at,
        speciality_name: notificationOriginalData.appointment.speciality_name,
        medical_center_name: notificationOriginalData.appointment.medical_center_name,
    }

    notification.request.body.patient = {
        fullname: notificationOriginalData.patient.fullname,
    };
    return notification;
}

function generateHighComplexityWebhookNotification(data, appointmentId, notificationTemplate, reason, requestId) {
    const url = process.env.HIGH_COMPLEXITY_WEBHOOK_URL || 'https://api.high-complexity-externo.com/v1/webhook';
    const notificationOriginalData = data.data;
    const notification = getDefaultWebhookNotificationTemplate(data, appointmentId, notificationTemplate, url, reason, requestId);
    return notification;
}

function generateCheckInWebhookNotification(data, appointmentId, notificationTemplate, reason, requestId) {
    const url = process.env.CHECK_IN_WEBHOOK_URL || 'https://api.check-in-externo.com/v1/webhook';
    const notificationOriginalData = data.data;
    const notification = getDefaultWebhookNotificationTemplate(data, appointmentId, notificationTemplate, url, reason, requestId);

    notification.request.body.appointment = {
        id: appointmentId,
        starts_at: notificationOriginalData.appointment.starts_at,
        checked_in_at: getFormattedTimestamp(),
    }

    
    notification.request.body.patient = {
        id: notificationOriginalData.patient.id,
    };

    console.log(`${requestId} - Check-in webhook notification payload:`, notification);
    return notification;
}

module.exports = {
    generateCreateAppointmentNotification,
    generateRescheduleAppointmentNotification,
    generateCancelAppointmentNotification,
    generateConfirmAppointmentNotification,
    generateCheckInAppointmentNotification,
    generateFinishAppointmentNotification,
    generateExpiredAppointmentNotification,
    generateReminderAppointmentNotification,
    generateAbsentAppointmentNotification,
    generateOperationsRoomWebhookNotification,
    generateHighComplexityWebhookNotification,
    generateCheckInWebhookNotification
};