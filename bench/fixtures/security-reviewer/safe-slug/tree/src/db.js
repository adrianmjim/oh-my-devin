const pool = { query: async (sql, params) => [] };

module.exports = {
  query: async (sql, params) => pool.query(sql, params),
};
