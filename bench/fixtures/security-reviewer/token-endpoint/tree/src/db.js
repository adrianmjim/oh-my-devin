const pool = { query: async (sql) => [] };

module.exports = {
  query: async (sql) => pool.query(sql),
};
