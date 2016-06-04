module.exports = function (qb) {
  return {
    countResidenceColumns(id) {
      return qb.from('ResidenceHistory').select('COUNT(*) AS total').where('PatientId =', id).exec();
    },
    getResidenceInfo(id, params) {
      // select RH.Id, Name, R.Number, StartResidenceDate, FinishResidenceDate
      // from ResidenceHistory AS RH JOIN Room AS R ON RH.RoomId = R.Id JOIN Building AS B ON B.Id = R.BuildingId
      // where RH.PatientId = 10
      // ORDER BY 4
      return qb.select('RH.Id', 'Name', 'R.Number', 'StartResidenceDate', 'FinishResidenceDate')
        .join('ResidenceHistory AS RH JOIN Room AS R ON RH.RoomId = R.Id JOIN Building AS B ON B.Id = R.BuildingId', true)
        .where('RH.PatientId =', id)
        .and(params.filter && params.filter !== 'Number' ? params.filter + ' = @value' :
          params.filter === 'Number' ? `R.${params.filter} = @value` : '')
        .orderBy(params.order ? `${params.order} ${params.asc === 'true' ? 'ASC' : 'DESC'}` : '4')
        .offsetFetch(params.page ? (params.page - 1) * 20 : 0, 20)
        .exec(params.value ? [{ name: 'value', value: params.value }] : undefined);
    },
    normalize(resultset) {
      resultset.forEach((res) => {
        res.StartResidenceDate = res.StartResidenceDate.toLocaleDateString();
        if (res.FinishResidenceDate) res.FinishResidenceDate = res.FinishResidenceDate.toLocaleDateString();
      });
      return resultset;
    },
    getPatientsName(id) {
      return qb.from('Person').select('FirstName, MiddleName, LastName').where('Id =', id).exec();
    },
    getWards() {
      return qb.select(`R.Id, CONCAT(Name, ', Ward №', R.Number) AS Ward`)
        .join('Room AS R JOIN Building AS B ON R.BuildingId = B.Id', true)
        .where('RoomTypeId = 1').exec();
    },
    movePerson(id, data) {
      let date = new Date();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let fullDate = `${date.getFullYear()}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
      data.StartResidenceDate = fullDate;
      data.PatientId = Number(id);
      data.RoomId = Number(data.RoomId);
      return qb.update('ResidenceHistory', { 'FinishResidenceDate': fullDate })
        .where('PatientId = ', id).and('FinishResidenceDate IS NULL').exec().then(() => {
          return qb.insert('ResidenceHistory', data).exec();
        });
    },
    getEditableInfo(recordId) {
      return qb.from('ResidenceHistory').select('RoomId, StartResidenceDate, FinishResidenceDate')
        .where('Id =', recordId).exec();
    },
    updateResidence(recordId, data) {
      data.RoomId = Number(data.RoomId);
      return qb.update('ResidenceHistory', data).where('Id =', recordId).exec();
    },
    deleteResidence(recordId) {
      return qb.delete('ResidenceHistory').where('Id =', recordId).exec();
    }
  }
}