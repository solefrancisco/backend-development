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

module.exports = {
    generateCreateAppointmentNotification,
    generateRescheduleAppointmentNotification,
    generateCancelAppointmentNotification,
    generateConfirmAppointmentNotification,
    generateCheckInAppointmentNotification,
    generateFinishAppointmentNotification,
    generateExpiredAppointmentNotification,
    generateReminderAppointmentNotification,
    generateAbsentAppointmentNotification
};