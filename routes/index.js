const express = require('express');
const router = express.Router();
const qb = require('../query_builder/query-builder')({
  server: 'localhost',
  user: 'meeferp',
  password: '111111',
  database: 'Hospital'
});
const building = require('../controllers/building');

// GET home page
router.get('/', (req, res, next) => {
  res.render('home');
});

router.get('/buildings', building.getBuildings.bind(null, qb));
router.get('/build', building.postBuildings.bind(null, qb));

module.exports = router;
