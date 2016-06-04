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
              table: { name: 'Patients', url: 'patients' }
            });
          }).catch(next);
      } else {
        patientServ.getPatients(req.query)
          .then((resultset) => {
            resultset.forEach((res) => {
              res.BirthDate = res.BirthDate.toLocaleDateString();
              res.Gender = res.Gender ? 'Male' : 'Famale';
            });
            res.json(resultset);
          }).catch(next);
      }
    },
    postPatientForm(req, res, next) {
      let buffer;
      fs.readFile(req.files.Photo.path, (err, data) => {
        buffer = Buffer.from(data);
        patientServ.insertPatient(req.body, buffer).then(() => {
          res.end("OK");
        }).catch(next);
      });
    },
    getPhoto(req, res, next) {
      patientServ.getPhoto().then((buffer) => {
        res.json({ image: buffer });
      }).catch(next);
    },
    getPatientInfo(req, res, next) {
      if (isNaN(Number(req.params.id))) return next();
      let photo;
      patientServ.getPatientInfo(req.params.id).then(([info]) => {
        photo = info.Photo;
        info.layout = false;
        info = patientServ.normalizePatient(info);
        return res.locals.hb.render('./views/patient/patientInfo.handlebars', info);
      }).then((html) => {
        res.json({ html, photo });
      }).catch(next);
    },
    deletePatient(req, res, next) {
      patientServ.deletePatient(req.params.id).then((rowsAffected) => {
        return patientServ.getPatients(req.query);
      }).then((records) => {
        res.json(patientServ.normalizePatient(records));
      }).catch(next);
    },
    editPatient(req, res, next) {
      patientServ.getPatientInfo(req.params.id).then(([info]) => {
        info.layout = false;
        info.BirthDate = info.BirthDate.toLocaleDateString();
        return res.locals.hb.render('./views/patient/edit.handlebars', info);
      }).then((html) => {
        res.send(html);
      }).catch(next);
    },
    putPatient(req, res, next) {
      let buffer;
      if (req.files.Photo.size != 0) {
        fs.readFile(req.files.Photo.path, (err, data) => {
          buffer = Buffer.from(data);
          patientServ.updatePatient(req.params.id, req.body, buffer).then(() => {
            return patientServ.getPatients(req.query);
          }).then((resultset) => {
            res.json(patientServ.normalizePatient(resultset));
          }).catch(next);
        });
      } else {
        patientServ.updatePatient(req.params.id, req.body).then(() => {
          return patientServ.getPatients(req.query);
        }).then((resultset) => {
          res.json(patientServ.normalizePatient(resultset));
        }).catch(next);
      }
    }
  }
}