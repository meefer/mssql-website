module.exports = {
  getBuildings(qb, req, res, next) {
    qb.select('Name', 'Address')
      .from('Building')
      .exec()
      .then((resultset) => {
        res.status(200).send(JSON.stringify(resultset));
      }).catch(next);
  },
  postBuildings(qb, req, res, next) {
    qb.insert('Building', {
      Name: 'Центральне віддлення',
      Address: 'вул. Василькова, 22',
      Number: 3
    }).exec()
      .then((resultset) => {
        res.status(200).send(JSON.stringify(resultset));
      }).catch(next);
  }
};