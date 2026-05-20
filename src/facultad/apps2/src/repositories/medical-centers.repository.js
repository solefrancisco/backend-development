class MySqlMedicalCentersRepository {
    constructor (pool) {
        this.pool=pool;
    }

    async findById(medicalCenterId) {
    try {
      const [rows] = await this.pool.query(
        `
          SELECT
            id,
            name,
            city,
            lat,
            lng
          FROM medical_centers
          WHERE id = ?
          LIMIT 1
        `,
        [medicalCenterId]
      );

      return { success: true, data: rows[0] ?? null };
    } catch (error) {
      return { success: false, sqlState: error.sqlState, errorMessage: error.message };
    }
  }

async findAll(limit, queryFilters) {
  try {
    let query = `
      SELECT
        id,
        name,
        city,
        lat,
        lng
      FROM medical_centers
    `;

    const conditions = [];
    const values = [];
    let page = 1;

    if (queryFilters.id !== undefined) {
      conditions.push('id = ?');
      values.push(queryFilters.id);
    }

    if (queryFilters.name) {
      conditions.push('name LIKE ?');
      values.push(`%${queryFilters.name}%`);
    }

    if (queryFilters.city) {
      conditions.push('city LIKE ?');
      values.push(`%${queryFilters.city}%`);
    }

    if (queryFilters.lat !== undefined) {
      conditions.push('lat = ?');
      values.push(queryFilters.lat);
    }

    if (queryFilters.lng !== undefined) {
      conditions.push('lng = ?');
      values.push(queryFilters.lng);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (queryFilters.page) {
      page = Number(queryFilters.page);
    }

    const offset = (page - 1) * limit;

    query += ' ORDER BY name ASC, id ASC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [rows] = await this.pool.query(query, values);

    return { success: true, data: rows };

  } catch (error) {
    return {
      success: false,
      sqlState: error.sqlState,
      errorMessage: error.message
    };
  }
}

  async count(queryFilters) {
  try {
    let query = `
      SELECT COUNT(1) AS count
      FROM medical_centers
    `;

    const conditions = [];
    const values = [];

    if (queryFilters.id !== undefined) {
      conditions.push('id = ?');
      values.push(queryFilters.id);
    }

    if (queryFilters.name) {
      conditions.push('name LIKE ?');
      values.push(`%${queryFilters.name}%`);
    }

    if (queryFilters.city) {
      conditions.push('city LIKE ?');
      values.push(`%${queryFilters.city}%`);
    }

    if (queryFilters.lat !== undefined) {
      conditions.push('lat = ?');
      values.push(queryFilters.lat);
    }

    if (queryFilters.lng !== undefined) {
      conditions.push('lng = ?');
      values.push(queryFilters.lng);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const [rows] = await this.pool.query(query, values);

    return { success: true, data: rows[0].count };

  } catch (error) {
    return {
      success: false,
      sqlState: error.sqlState,
      errorMessage: error.message
    };
  }
}
}

module.exports = {MySqlMedicalCentersRepository};