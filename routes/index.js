var express = require('express');
var router = express.Router();

// GET home page
router.get('/', (req, res, next) => {
  res.render('home');
});

// GET home page
router.get('/about', (req, res, next) => {
  res.render('about');
});

module.exports = router;
