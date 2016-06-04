const express = require('express');
const router = express.Router();
const qb = require('../query_builder/qb');
const bodyParser = require('body-parser');
const patientController = require('../controllers/patientController.js')(qb);
const residenceController = require('../controllers/residenceController.js')(qb);
const qsTables = require('../tableConfig.json').quickStartTables;
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

// GET home page
router.get('/', (req, res, next) => {
  res.render('home', { qsTables });
});

router.get('/about', (req, res, next) => {
  res.render('about');
});
/***** Residence *****/
router.get('/patients/:id/residence', residenceController.getPatientResidence);
/***** Patients ******/
router.get('/patients', patientController.getPatients);
router.get('/patients/:id/edit', patientController.editPatient);
router.put('/patients/:id/edit', multipartMiddleware, patientController.putPatient);
router.get('/patients/:id', patientController.getPatientInfo);
router.get('/patients/new', patientController.getPatientForm);
router.post('/patients/new', multipartMiddleware, patientController.postPatientForm);
router.delete('/patients/:id', patientController.deletePatient);

module.exports = router;