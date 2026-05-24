class MySqlMedicalCentersRepository {
  constructor (pool) {
    this.pool=pool;
  }

  async filter(queryFilters, query) {
    let conditions = [];
    let values = [];
    let page = 1;

    if (queryFilters.name) {
      conditions.push('LOWER(name) LIKE ?');
      values.push(`%${queryFilters.name.toLowerCase()}%`);
    }

    if (queryFilters.city) {
      conditions.push('LOWER(city) LIKE ?');
      values.push(`%${queryFilters.city.toLowerCase()}%`);
    }

    if (queryFilters.lat) {
      conditions.push('lat BETWEEN ? AND ?');
      values.push(queryFilters.lat - 0.1, queryFilters.lat + 0.1);
    }

    if (queryFilters.lng) {
      conditions.push('lng BETWEEN ? AND ?');
      values.push(queryFilters.lng - 0.1, queryFilters.lng + 0.1);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (queryFilters.page) {
      page = Number(queryFilters.page);
    }
    
    return { query, conditions, values, page };
  }


  async findById(medicalCenterId) {
    try {
      const [rows] = await this.pool.query(
        `
          SELECT
            id,
            name
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
      const baseQuery = `
        SELECT
          id,
          name,
          city,
          lat,
          lng
        FROM medical_centers
      `;

      const { query, conditions, values, page } = await this.filter(queryFilters, baseQuery);
      const offset = (page - 1) * limit;
      const finalQuery = query + ' ORDER BY name ASC, id ASC LIMIT ? OFFSET ?';
      values.push(limit, offset);

      const [rows] = await this.pool.query(finalQuery, values);

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
      const baseQuery = `
        SELECT COUNT(1) AS count
        FROM medical_centers
      `;
      
      const { query, conditions, values, page } = await this.filter(queryFilters, baseQuery);
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