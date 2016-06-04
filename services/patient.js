module.exports = function (qb) {
  return {
    insertPerson(data) {
      //  insert into Patient (Id) values (2)
      //  select top (1) Id from Patient order by Id desc
      return new qb.sql.Request()
        .input('value', qb.sql.VarBinary, data.Photo)
        .query(`insert into Person (FirstName, MiddleName, LastName, BirthDate, Gender, Photo) values ('${data.FirstName}','${
          data.MiddleName}','${data.LastName}','${data.BirthDate}',${data.Gender},@value)`);
    }, 
    getPhoto() {
      return qb.from('Person').select('Photo').where('Id = 2').exec();
    }
  };
}