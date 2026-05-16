class MySqlSpecialitiesRepository {
  constructor(pool) {
    this.pool = pool;
  }
  
  async findById(specialityId) {
    try {
      const [rows] = await this.pool.query(
        `
          SELECT
            id,
            name,
            is_high_complexity
          FROM specialities
          WHERE id = ?
          LIMIT 1
        `,
        [specialityId]
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
            id,
            name,
            is_high_complexity
          FROM specialities
        `;

      let conditions = [];
      let values = [];
      let page = 1;

      if (queryFilters.is_high_complexity !== undefined) {
        conditions.push('is_high_complexity = ?');
        values.push(queryFilters.is_high_complexity);
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
          FROM specialities
        `;

      let conditions = [];
      let values = [];

      if (queryFilters.is_high_complexity !== undefined) {
        conditions.push('is_high_complexity = ?');
        values.push(queryFilters.is_high_complexity);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
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
}

module.exports = { MySqlSpecialitiesRepository };