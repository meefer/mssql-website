module.exports = function (qb) {
  const recordCount = 20;
  const fs = require('fs');
  const patientServ = require('../services/patient')(qb);
  const crudServ = require('../services/crud')(qb);
  return {
    getPatientForm(req, res, next) {
      res.render('patient/new.handlebars');
    },
    getPatients(req, res, next) {
      if (!req.query.page && !req.query.order && !req.query.filter) {
        crudServ.selectColumns('Patient', 'COUNT(*) AS total')
          .then((resultset) => {
            res.render('patient/patients.handlebars', {
              total: Math.ceil(resultset[0].total / recordCount),
              table: { name: 'Patients', url: 'patients/new' }
            });
          }).catch(next);
      } else {
        crudServ.selectAll('Person', req.query)
          .then((resultset) => {
            res.json(resultset);
          }).catch(next);
      }
    },
    postPatientForm(req, res, next) {
      let buffer;
      fs.readFile(req.files.Photo.path, (err, data) => {
        buffer = Buffer.from(data);
        req.body.Photo = buffer;
        patientServ.insertPatient(req.body).then(() => {
          res.end("OK");
        }).catch(next);
      });
    },
    getPhoto(req, res, next) {
      patientServ.getPhoto().then((buffer) => {
        res.json({ image: buffer });
      }).catch(next);
    }
  }
}