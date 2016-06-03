const express = require('express');
const query = require('qs-middleware');
const bodyParser = require('body-parser');
const router = express.Router();
const qb = require('../query_builder/qb');
const controller = require('../controllers/crudController')(qb);
const qsTables = require('../tableConfig.json').quickStartTables;

router.use(query());
let tableChecker = (req, res, next) => {
  let table = qsTables.filter(tab => tab.url === req.params.table);
  if (!table.length) {
    let err = new Error('Not Found');
    err.status = 404;
    return next(err);
  }
  res.locals.table = table[0];
  next();
};

/*router.get('/eq', function(req, res, next) {
  let roomid = Math.ceil(Math.random() * 53);
  let roomequiid = Math.ceil(Math.random() * 41);
  if(roomid == 8 || roomid == 24) return res.send("Failed");
  if(roomequiid == 6 || roomequiid == 4 || roomequiid == 28 || roomequiid == 39) return res.send("Failed");;
  qb.insert(
    'RoomEquipmentSet', {
      'RoomId': roomid,//8, 24
      'RoomEquipmentId': roomequiid, // 6, 28, 39
      'Quantity': Math.ceil(Math.random()*8)
    }
  ).exec().then((data) => {res.send(`Success! + ${data}`);}).catch(next);
})*/

router.get('/:table', tableChecker, controller.getTableEntries);
router.post('/:table', [tableChecker, bodyParser.urlencoded({ extended: true })], controller.postTableEntry);
router.put('/:table/:id', [tableChecker, bodyParser.urlencoded({ extended: true })], controller.putTableEntry);
router.delete('/:table/:id', tableChecker, controller.deleteTableEntry);

module.exports = router;
