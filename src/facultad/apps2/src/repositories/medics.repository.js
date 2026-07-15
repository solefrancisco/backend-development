class MySqlMedicsRepository {
    constructor(pool) {
        this.pool = pool;
    }

    async findAllIds() {
        try {
            const [rows] = await this.pool.query(
                `
                    SELECT
                        core_user_id AS medic_id
                    FROM cached_medics
                    ORDER BY core_user_id ASC
                `
            );

            return { success: true, data: rows };
        } catch (error) {
            return { success: false, sqlState: error.sqlState, errorMessage: error.message };
        }
    }

    async saveId(medicId) {
        try {
            await this.pool.query(
                `
                    INSERT INTO cached_medics (core_user_id)
                    VALUES (?)
                    ON DUPLICATE KEY UPDATE
                        core_user_id = VALUES(core_user_id)
                `,
                [medicId]
            );

            return { success: true, data: { medic_id: medicId } };
        } catch (error) {
            return { success: false, sqlState: error.sqlState, errorMessage: error.message };
        }
    }
}

module.exports = { MySqlMedicsRepository };
