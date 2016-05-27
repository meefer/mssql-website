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
const building = require('../controllers/building');

router.use(query());
// GET home page
router.get('/', (req, res, next) => {
  res.render('home');
});
router.get('/buildings', building.getBuildings.bind(null, qb));
router.post('/building', bodyParser.urlencoded({ extended: true }), (req, res) => {
  res.send(`INSERT ${JSON.stringify(req.body)}`);
});
router.put('/building/:id', bodyParser.urlencoded({ extended: true }), (req, res) => {
  res.send(`UPDATE ${JSON.stringify(req.body)} WHERE ID = ${req.params.id}`);
});

module.exports = router;
