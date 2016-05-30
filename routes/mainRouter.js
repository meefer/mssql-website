const express = require('express');
const router = express.Router();
const qsTables = require('../tableConfig.json').quickStartTables;

// GET home page
router.get('/', (req, res, next) => {
  res.render('home', { qsTables });
});

router.get('/about', (req, res, next) => {
  res.render('about');
});

module.exports = router;