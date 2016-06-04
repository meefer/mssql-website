module.exports = function (qb) {
  const recordCount = 20;
  const fs = require('fs');
  const residenceServ = require('../services/residenceServ')(qb);
  const crudServ = require('../services/crud')(qb);
  return {
    getPatientResidence(req, res, next) {
      
      res.render('...');
    }
  }
}