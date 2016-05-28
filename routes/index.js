const express = require('express');
const query = require('qs-middleware');
const bodyParser = require('body-parser');
const router = express.Router();
const qb = require('../query_builder/query-builder')({
  server: 'localhost',
  user: 'meeferp',
  password: '111111',
  database: 'Hospital'
});
const building = require('../controllers/building')(qb);

router.use(query());
// GET home page
router.get('/', (req, res, next) => {
  res.render('home');
});
router.get('/buildings', building.getBuildings);
router.post('/building', bodyParser.urlencoded({ extended: true }), building.postBuilding);
router.put('/building/:id', bodyParser.urlencoded({ extended: true }), building.putBuilding);
router.delete('/building/:id', building.deleteBuilding);

module.exports = router;
