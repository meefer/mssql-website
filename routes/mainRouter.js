const express = require('express');
const router = express.Router();
const qb = require('../query_builder/qb');
const patient = require('../controllers/patientController.js')(qb);
const qsTables = require('../tableConfig.json').quickStartTables;

// GET home page
router.get('/', (req, res, next) => {
  res.render('home', { qsTables });
});

router.get('/about', (req, res, next) => {
  res.render('about');
});

router.get('/patients', function() {
}, patient.post);

module.exports = router;