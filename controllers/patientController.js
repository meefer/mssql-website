module.exports = function (qb) {
  const hb = require('express-handlebars');
  return {
    post(req, res, next) {
      res.send(hb.render('<p>CURLYK!</p>'));
    }
  }
}