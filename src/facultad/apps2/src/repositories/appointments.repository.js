class MySqlAppointmentsRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(data) {
    try {
      const [result] = await this.pool.query(
        `
          CALL sp_create_appointment(?, ?, ?, ?, ?, ?)
        `,
        [
          data.medic.id, 
          data.patient.id, 
          data.appointment.center_id, data.appointment.speciality_id, data.appointment.starts_at, data.appointment.ends_at
        ]
      );
      return { success: true, data: result[0][0].appointment_id };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async findById(appointmentId) {
    try {
      const [rows] = await this.pool.query(
        `
          SELECT
            id,
            medic_id,
            patient_id,
            center_id,
            speciality_id,
            status,
            DATE_FORMAT(starts_at, '%Y-%m-%d %H:%i:%s') AS starts_at,
            DATE_FORMAT(ends_at, '%Y-%m-%d %H:%i:%s') AS ends_at,
            DATE_FORMAT(confirmed_at, '%Y-%m-%d %H:%i:%s') AS confirmed_at,
            DATE_FORMAT(checked_in_at, '%Y-%m-%d %H:%i:%s') AS checked_in_at,
            DATE_FORMAT(cancelled_at, '%Y-%m-%d %H:%i:%s') AS cancelled_at,
            DATE_FORMAT(completed_at, '%Y-%m-%d %H:%i:%s') AS completed_at,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
          FROM appointments
          WHERE id = ?
          LIMIT 1
        `,
        [appointmentId]
      );

      return { success: true, data: rows[0] ?? null };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async findAll(limit, queryFilters) {
    try{
      let query = `
          SELECT
            a.id,
            a.medic_id,
            a.patient_id,
            a.center_id,
            a.speciality_id,
            a.status,
            DATE_FORMAT(a.starts_at, '%Y-%m-%d %H:%i:%s') AS starts_at,
            DATE_FORMAT(a.ends_at, '%Y-%m-%d %H:%i:%s') AS ends_at,
            DATE_FORMAT(a.confirmed_at, '%Y-%m-%d %H:%i:%s') AS confirmed_at,
            DATE_FORMAT(a.checked_in_at, '%Y-%m-%d %H:%i:%s') AS checked_in_at,
            DATE_FORMAT(a.cancelled_at, '%Y-%m-%d %H:%i:%s') AS cancelled_at,
            DATE_FORMAT(a.completed_at, '%Y-%m-%d %H:%i:%s') AS completed_at,
            DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS created_at
          FROM appointments a
        `;

      let conditions = [];
      let values = [queryFilters.since, queryFilters.until];
      let page = 1;

      if (queryFilters.patient_id) {
        conditions.push('patient_id = ?');
        values.push(queryFilters.patient_id);
      }

      if (queryFilters.medic_id) {
        conditions.push('medic_id = ?');
        values.push(queryFilters.medic_id);
      }

      if (queryFilters.medical_center_id) {
        conditions.push('center_id = ?');
        values.push(queryFilters.medical_center_id);
      }

      if(queryFilters.speciality_id) {
        conditions.push('speciality_id = ?');
        values.push(queryFilters.speciality_id);
      }
      
      query += " WHERE starts_at between ? AND ? AND status NOT IN ('EXPIRED', 'CANCELLED') ";

      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      if (queryFilters.page) {
        page = Number(queryFilters.page);
      }
      
      const offset = (page - 1) * limit;
      query += ' ORDER BY starts_at ASC, id ASC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const [rows] = await this.pool.query(
        query,
        values
      );

      return { success: true, data: rows };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async count(queryFilters) {
    try{
      let query = `
          SELECT COUNT(1) AS count 
          FROM appointments
        `;

      let conditions = [];
      let values = [queryFilters.since, queryFilters.until];

      if (queryFilters.patient_id) {
        conditions.push('patient_id = ?');
        values.push(queryFilters.patient_id);
      }

      if (queryFilters.medic_id) {
        conditions.push('medic_id = ?');
        values.push(queryFilters.medic_id);
      }

      if (queryFilters.medical_center_id) {
        conditions.push('center_id = ?');
        values.push(queryFilters.medical_center_id);
      }

      if(queryFilters.speciality_id) {
        conditions.push('speciality_id = ?');
        values.push(queryFilters.speciality_id);
      }

      query += " WHERE starts_at between ? AND ? AND status NOT IN ('EXPIRED', 'CANCELLED') ";

      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      const [rows] = await this.pool.query(
        query,
        values
      );
      return { success: true, data: rows[0].count };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async findByMedicId(medicId, limit, offset) {
    try {
      const [rows] = await this.pool.query(
        `
          SELECT
            id,
            medic_id,
            patient_id,
            center_id,
            speciality_id,
            status,
            DATE_FORMAT(starts_at, '%Y-%m-%d %H:%i:%s') AS starts_at,
            DATE_FORMAT(ends_at, '%Y-%m-%d %H:%i:%s') AS ends_at,
            DATE_FORMAT(confirmed_at, '%Y-%m-%d %H:%i:%s') AS confirmed_at,
            DATE_FORMAT(checked_in_at, '%Y-%m-%d %H:%i:%s') AS checked_in_at,
            DATE_FORMAT(cancelled_at, '%Y-%m-%d %H:%i:%s') AS cancelled_at,
            DATE_FORMAT(completed_at, '%Y-%m-%d %H:%i:%s') AS completed_at,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
          FROM appointments
          WHERE medic_id = ?
          ORDER BY starts_at ASC, id ASC
          LIMIT ?
          OFFSET ?
      `,
      [medicId, limit, offset]
    );

      return { success: true, data: rows };    
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async findByPatientId(patientId, limit, offset) {
    try {
      const [rows] = await this.pool.query(
        `
          SELECT
            id,
            medic_id,
            patient_id,
            center_id,
            speciality_id,
            status,
            DATE_FORMAT(starts_at, '%Y-%m-%d %H:%i:%s') AS starts_at,
            DATE_FORMAT(ends_at, '%Y-%m-%d %H:%i:%s') AS ends_at,
            DATE_FORMAT(confirmed_at, '%Y-%m-%d %H:%i:%s') AS confirmed_at,
            DATE_FORMAT(checked_in_at, '%Y-%m-%d %H:%i:%s') AS checked_in_at,
            DATE_FORMAT(cancelled_at, '%Y-%m-%d %H:%i:%s') AS cancelled_at,
            DATE_FORMAT(completed_at, '%Y-%m-%d %H:%i:%s') AS completed_at,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
          FROM appointments
          WHERE patient_id = ?
          ORDER BY starts_at ASC, id ASC
          LIMIT ?
          OFFSET ?
        `,
        [patientId, limit, offset]
      );

      return { success: true, data: rows };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async confirm(appointmentId) {
    try{
      const [result] = await this.pool.query(
        `
          UPDATE appointments
          SET
            status = 'CONFIRMED',
            confirmed_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND status = 'PENDING_CONFIRMATION';
        `,
        [appointmentId]
      );

      return { success: true, data: { affectedRows: result.affectedRows > 0 } };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async checkIn(appointmentId) {
    try{
      const [result] = await this.pool.query(
        `
          UPDATE appointments
          SET
            status = 'CHECKED_IN',
            checked_in_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND status = 'CONFIRMED'
        `,
        [appointmentId]
      );

      return { success: true, data: { affectedRows: result.affectedRows > 0 } };  
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async complete(appointmentId) {
    try{
      const [result] = await this.pool.query(
        `
          UPDATE appointments
          SET
            status = 'COMPLETED',
            completed_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND status = 'CHECKED_IN'
        `,
        [appointmentId]
      );

      return { success: true, data: { affectedRows: result.affectedRows > 0 } };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async cancel(appointmentId) {
    try{
      const [result] = await this.pool.query(
        `
          UPDATE appointments
          SET
            status = 'CANCELLED',
            cancelled_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND status IN ('PENDING_CONFIRMATION', 'CONFIRMED')
        `,
        [appointmentId]
      );

      return { success: true, data: { affectedRows: result.affectedRows > 0 } };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async expirePendingConfirmationsBeforeNow() {
    try{
      const [result] = await this.pool.query(
        `
          UPDATE appointments
          SET
            status = 'EXPIRED',
            cancelled_at = CURRENT_TIMESTAMP
          WHERE status = 'PENDING_CONFIRMATION'
            AND starts_at < CURRENT_TIMESTAMP
        `
      );

      return { success: true, data: { affectedRows: result.affectedRows > 0 } };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async reschedule (data, id) {
    try{
      const [result] = await this.pool.query(
        `
          UPDATE appointments
          SET
             starts_at = ?,
             ends_at = ?
          WHERE id = ?
            AND status IN ('PENDING_CONFIRMATION', 'CONFIRMED')
        `,
        [data.starts_at, data.ends_at, id]
      );

      return { success: true, data: { affectedRows: result.affectedRows > 0 } };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async findOccupiedAppointments(queryFilters) {
    try {
      const [rows] = await this.pool.query(
        `
          SELECT
            id,
            DATE_FORMAT(starts_at, '%Y-%m-%d %H:%i:%s') AS starts_at
          FROM appointments
          WHERE starts_at between ? AND ?
        `,
        [queryFilters.since, queryFilters.until]
      );

      return { success: true, data: rows };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

  async findMockedUsers(queryFilters) {
    try {
      const [rows] = await this.pool.query(
        `
          SELECT
            fullname,
            email
          FROM mocked_users
        `,
      );

      return { success: true, data: rows };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }
}

module.exports = { MySqlAppointmentsRepository };