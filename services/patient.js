module.exports = function (qb) {
  return {
    insertPatient(data, buffer) {
      // "INSERT INTO Person (FirstName,MiddleName,LastName,BirthDate,Gender,Photo) VALUES (N'Olan',N'Lohan',N'Handelveider',N'1979-01-21',N'1',N'@photo')"
      //  insert into Patient (Id) values (2)
      //  select top (1) Id from Patient order by Id desc
      return new qb.sql.Request()
        .input('photo', qb.sql.VarBinary, buffer)
        .query(`INSERT INTO Person (FirstName,MiddleName,LastName,BirthDate,Gender,Photo) VALUES (N'${
        data.FirstName}',N'${data.MiddleName}',N'${data.LastName}',N'${data.BirthDate}',${data.Gender},@photo)`)
        .then(() => {
          return qb.from('Person').select('TOP (1) Id').orderBy('Id DESC').exec();
        }).then(([record]) => {
          return qb.insert('Patient', record).exec();
        });
    },
    getPatients(params) {
      return qb.select('Pa.Id,FirstName,MiddleName,LastName,BirthDate,Gender')
        .join('Patient AS Pa JOIN Person AS Pe ON Pa.Id = Pe.Id', true)
        .where(params.filter ? params.filter + ' = @value' : '')
        .orderBy(params.order ? `${params.order} ${params.asc === 'true' ? 'ASC' : 'DESC'}` : '1')
        .offsetFetch(params.page ? (params.page - 1) * 20 : 0, 20)
        .exec(params.value ? [{ name: 'value', value: params.value }] : undefined)
    },
    getPatientInfo(id) {
      return qb.from('Person').select('FirstName,MiddleName,LastName,BirthDate,Gender,Photo').where('Id = ', id).exec();
    },
    deletePatient(id) {
      return qb.delete('Patient')
        .where('Id =', id)
        .exec()
        .then(() => {
          return qb.delete('Person')
            .where('Id =', id)
            .exec();
        });
    },
    updatePatient(id, data, buffer) {
      if (buffer) {
        let q = `UPDATE Person SET FirstName=N'${data.FirstName}',MiddleName=N'${data.MiddleName}',LastName=N'${data.LastName
          }',BirthDate=N'${data.BirthDate}',Gender=${data.Gender},Photo=@photo WHERE Id = ${id}`;
        return new qb.sql.Request()
          .input('photo', qb.sql.VarBinary, buffer)
          .query(q);
      }
      else {
        return qb.update('Person', data).where('Id =', id).exec();
      }
    },
    normalizePatient(resultset) {
      if (!resultset.forEach) {
          resultset.BirthDate = resultset.BirthDate.toLocaleDateString();
          resultset.Gender = resultset.Gender ? 'Male' : 'Famale';
      }
      else {
        resultset.forEach((res) => {
          res.BirthDate = res.BirthDate.toLocaleDateString();
          res.Gender = res.Gender ? 'Male' : 'Famale';
        });
      }
      return resultset;
    }
  };
}