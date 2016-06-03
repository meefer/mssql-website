const qb = require('./query-builder')({
  server: 'localhost',
  user: 'meeferp',
  password: '111111',
  database: 'Hospital'
});

module.exports = qb;