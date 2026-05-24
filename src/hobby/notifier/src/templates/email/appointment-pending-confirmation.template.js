const {
  buildAppointmentPatientEmailLayout,
  buildAppointmentMedicEmailLayout,
  buildAppointmentPatientEmailText,
  buildAppointmentMedicEmailText,
} = require('./base-email.template');

function renderAppointmentPendingConfirmationTemplate(data) {
  return [
    {
      to: data.patient.email,
      destination: 'patient',
      template: buildPatientTemplate(data),
    },
    {
      to: data.medic.email,
      destination: 'medic',
      template: buildMedicTemplate(data),
    },
  ];
}

function buildPatientTemplate(data) {
  const subject = 'Confirmación de turno pendiente';

  return {
    subject,
    html: buildAppointmentPatientEmailLayout({
      title: 'Confirmación de turno',
      preheader: 'Tu turno fue registrado correctamente y está pendiente de confirmación.',
      badgeText: 'Pendiente',
      badgeBackground: '#FFF4E5',
      badgeColor: '#C86A00',
      intro: 'tu turno fue registrado correctamente y quedó pendiente de confirmación.',
      patient_name: data.patient.fullname,
      medic_name: data.medic.fullname,
      speciality: data.appointment.speciality_name,
      starts_at: data.appointment.starts_at,
      medical_center_name: data.appointment.medical_center_name,
      ctaText: 'Te notificaremos nuevamente cuando el turno sea confirmado o cancelado.',
      footerNote: 'Por favor verificá los datos del turno y mantenete atento a futuras actualizaciones.',
      notification_sent_by: data.notification_sent_by,
      headerBackground: 'linear-gradient(135deg, #FFF7ED 0%, #FFE2B8 100%)',
      headerEyebrowColor: '#9A6700',
      headerTitleColor: '#7A4B00',
    }),
    text: buildAppointmentPatientEmailText({
      title: 'Confirmación de turno',
      intro: 'tu turno fue registrado correctamente y quedó pendiente de confirmación.',
      patient_name: data.patient.fullname,
      medic_name: data.medic.fullname,
      speciality: data.appointment.speciality_name,
      starts_at: data.appointment.starts_at,
      medical_center_name: data.appointment.medical_center_name,
      footerNote:
        'Te notificaremos nuevamente cuando el turno sea confirmado o cancelado.\n\n' +
        'Por favor verificá los datos del turno y mantenete atento a futuras actualizaciones.',
      notification_sent_by: data.notification_sent_by,
    }),
  };
}

function buildMedicTemplate(data) {
  const subject = 'Nuevo turno pendiente de confirmación';

  return {
    subject,
    html: buildAppointmentMedicEmailLayout({
      title: 'Nuevo turno solicitado',
      preheader: 'Se registró un nuevo turno pendiente de confirmación.',
      badgeText: 'Pendiente',
      badgeBackground: '#EEF4FF',
      badgeColor: '#175CD3',
      intro: 'se registró un nuevo turno asociado a tu agenda profesional.',
      patient_name: data.patient.fullname,
      medic_name: data.medic.fullname,
      speciality: data.appointment.speciality_name,
      starts_at: data.appointment.starts_at,
      medical_center_name: data.appointment.medical_center_name,
      ctaText: 'El turno permanece pendiente hasta recibir confirmación o cancelación.',
      footerNote: 'Este mensaje es únicamente informativo para mantener actualizada tu agenda.',
      notification_sent_by: data.notification_sent_by,
      headerBackground: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      headerEyebrowColor: '#1D4ED8',
      headerTitleColor: '#1E3A8A',
    }),
    text: buildAppointmentMedicEmailText({
      title: 'Nuevo turno solicitado',
      intro: 'se registró un nuevo turno asociado a tu agenda profesional.',
      patient_name: data.patient.fullname,
      medic_name: data.medic.fullname,
      speciality: data.appointment.speciality_name,
      starts_at: data.appointment.starts_at,
      medical_center_name: data.appointment.medical_center_name,
      footerNote:
        'El turno permanece pendiente hasta recibir confirmación o cancelación.\n\n' +
        'Este mensaje es únicamente informativo para mantener actualizada tu agenda.',
      notification_sent_by: data.notification_sent_by,
    }),
  };
}

module.exports = { renderAppointmentPendingConfirmationTemplate };