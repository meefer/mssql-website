module.exports = function (qb) {
  const recordCount = 20;
  const fs = require('fs');
  const residenceServ = require('../services/residenceServ')(qb);
  let getPatientName = (patientId) => {
    return residenceServ.getPatientsName(patientId).then(([parted]) => {
      return `${parted.FirstName} ${parted.MiddleName} ${parted.LastName}`;
    });
  }
  return {
    getPatientResidence(req, res, next) {
      let id = req.params.id;
      if (!req.query.page && !req.query.order && !req.query.filter) {
        let cols = '';
        residenceServ.countResidenceColumns(id)
          .then((countResult) => {
            [cols] = countResult;
            return getPatientName(id);
          }).then((name) => {
            res.render('patient/residence.handlebars', {
              total: Math.ceil(cols.total / recordCount),
              table: { name: 'Residence history of ' + name, person: name, url: `patients/${id}/residence` }
            });
          }).catch(next);
      } else {
        residenceServ.getResidenceInfo(id, req.query)
          .then((resultset) => {
            res.json(residenceServ.normalize(resultset));
          }).catch(next);
      }
    },
    getMovePatientForm(req, res, next) {
      residenceServ.getWards().then((resultset) => {
        resultset.layout = false;
        res.render('patient/residenceMove.handlebars', resultset);
      }).catch(next);
    },
    movePatient(req, res, next) {
      let id = req.params.id;
      residenceServ.movePerson(id, req.body).then(() => {
        return residenceServ.getResidenceInfo(id, req.query);
      }).then((resultset) => {
        res.json(residenceServ.normalize(resultset));
      }).catch(next);
    },
    getEditForm(req, res, next) {
      let recordId = req.params.recordid;
      let wards;
      residenceServ.getWards().then((resultset) => {
        wards = resultset;
        return residenceServ.getEditableInfo(recordId);
      }).then(([result]) => {
        wards.forEach((ward) => {
          if (ward.Id === result.RoomId) ward.selected = true;
        })
        result.items = wards;
        result.layout = false;
        result.StartResidenceDate = result.StartResidenceDate.toLocaleDateString();
        result.FinishResidenceDate = result.FinishResidenceDate.toLocaleDateString();
        res.render('patient/residenceEdit.handlebars', result);
      }).catch(next);
    },
    editResidenceHistory(req, res, next) {
      residenceServ.updateResidence(req.params.recordid, req.body).then(() => {
        return residenceServ.getResidenceInfo(req.params.id, req.query);
      }).then((resultset) => {
        res.json(residenceServ.normalize(resultset));
      }).catch(next);
    },
    deletePatientResidence(req, res, next) {
      residenceServ.deleteResidence(req.params.recordid).then(() => {
        return residenceServ.getResidenceInfo(req.params.id, req.query);
      }).then((resultset) => {
        res.json(residenceServ.normalize(resultset));
      }).catch(next);
    }
  }
}