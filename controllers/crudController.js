module.exports = function (qb) {
  let recordCount = 20;
  const crudServ = require('../services/crud')(qb);
  const qsTables = require('../tableConfig.json').quickStartTables;
  return {
    getTableEntries(req, res, next) {
      let table = res.locals.table;
      if (!req.query.page && !req.query.order && !req.query.filter) {
        crudServ.selectColumns(table.name, 'COUNT(*) AS total')
          .then((resultset) => {
            res.render('crud.handlebars', { total: Math.ceil(resultset[0].total / recordCount), table });
          }).catch(next);
      } else {
        crudServ.selectAll(table.name, req.query)
          .then((resultset) => {
            res.json(resultset);
          }).catch(next);
      }
    },
    putTableEntry(req, res, next) {
      let tableName = res.locals.table.name;
      crudServ.update(tableName, req.body, req.params.id).then((resultset) => {
        return crudServ.selectAll(tableName, req.query);
      }).then((resultset) => {
        res.json(resultset);
      }).catch(next);
    },
    postTableEntry(req, res, next) {
      let tableName = res.locals.table.name;
      crudServ.insertInto(tableName, req.body).then((resultset) => {
        return crudServ.selectAll(tableName, req.query);
      }).then((resultset) => {
        res.json(resultset);
      }).catch(next);
    },
    deleteTableEntry(req, res, next) {
      let tableName = res.locals.table.name;
      crudServ.deleteFrom(tableName, req.params.id).then((resultset) => {
        return crudServ.selectAll(tableName, req.query);
      }).then((resultset) => {
        res.json(resultset);
      }).catch(next);
    }
  };
}