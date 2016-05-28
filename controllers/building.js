module.exports = function (qb) {
  let recordCount = 20;
  const crudServ = require('../services/crud')(qb);
  return {
    getBuildings(req, res, next) {
      if (!req.query.page && !req.query.order && !req.query.filter) {
        crudServ.selectColumns('Building', 'COUNT(*) AS total')
          .then((resultset) => {
            res.render('buildings.handlebars', { total: Math.ceil(resultset[0].total / recordCount) });
          }).catch(next);
      } else {
        crudServ.selectAll('Building', req.query)
          .then((resultset) => {
            res.json(resultset);
          }).catch(next);
      }
    },
    putBuilding(req, res, next) {
      crudServ.update('Building', req.body, req.params.id).then((resultset) => {
        return crudServ.selectAll('Building', req.query);
      }).then((resultset) => {
        res.json(resultset);
      }).catch(next);
    },
    postBuilding(req, res, next) {
      crudServ.insertInto('Building', req.body).then((resultset) => {
        return crudServ.selectAll('Building', req.query);
      }).then((resultset) => {
        res.json(resultset);
      }).catch(next);
    },
    deleteBuilding(req, res, next) {
      crudServ.deleteFrom('Building', req.params.id).then((resultset) => {
        return crudServ.selectAll('Building', req.query);
      }).then((resultset) => {
        res.json(resultset);
      }).catch(next);
    }
  };
}