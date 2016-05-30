const express = require('express');
const query = require('qs-middleware');
const bodyParser = require('body-parser');
const router = express.Router();
const qb = require('../query_builder/query-builder')({
  server: 'localhost',
  user: 'meeferp',
  password: '111111',
  database: 'Hospital'
});
const controller = require('../controllers/crudController')(qb);
const qsTables = require('../tableConfig.json').quickStartTables;

router.use(query());
let tableChecker = (req, res, next) => {
  let table = qsTables.filter(tab => tab.url === req.params.table);
  if (!table.length) {
    let err = new Error('Not Found');
    err.status = 404;
    return next(err);
  }
  res.locals.table = table[0];
  next();
};

router.get('/:table', tableChecker, controller.getTableEntries);
router.post('/:table', [tableChecker, bodyParser.urlencoded({ extended: true })], controller.postTableEntry);
router.put('/:table/:id', [tableChecker, bodyParser.urlencoded({ extended: true })], controller.putTableEntry);
router.delete('/:table/:id', tableChecker, controller.deleteTableEntry);

module.exports = router;
