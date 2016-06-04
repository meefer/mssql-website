const express = require('express');
const router = express.Router();
const qb = require('../query_builder/qb');
const bodyParser = require('body-parser');
const patient = require('../controllers/patientController.js')(qb);
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

router.get('/patients', patient.getPatients);
router.get('/patients/new', patient.getPatientForm);
router.post('/patients/new', multipartMiddleware, patient.postPatientForm);
router.get('/photo', patient.getPhoto);

module.exports = router;