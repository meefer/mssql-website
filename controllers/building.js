let recordCount = 20;
module.exports = {
  getBuildings(qb, req, res, next) {
    if (!req.query.page) {
      qb.select('COUNT(*) AS total')
        .from('Building')
        .exec()
        .then((resultset) => {
          res.render('buildings.handlebars', { total: Math.ceil(resultset[0].total / recordCount) });
        }).catch(next);
    } else {
      qb.select()
        .from('Building')
        .orderBy('Name')
        .offsetFetch((req.query.page - 1)*recordCount, recordCount)
        .exec()
        .then((resultset) => {
          res.json(resultset);
        }).catch(next);
    }
  },
  postBuildings(qb, req, res, next) {
    qb.insert('Building', {
      Name: '-',
      Address: '-',
      Number: 3
    }).exec()
      .then((resultset) => {
        res.status(200).send(JSON.stringify(resultset));
      }).catch(next);
  },
  test(qb, req, res, next) {
    res.status(200).send(qb.join(new Map([
      ['Building AS B', false],
      ['Room AS R', false],
      ['RoomEquipmentSet AS RES', false],
      ['RoomEquipment AS RE', true]
    ]))
    );
  }
};