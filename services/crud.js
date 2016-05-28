module.exports = function (qb) {
  return {
    selectColumns(table, ...columns) {
      return qb.select(...columns)
        .from(table)
        .exec()
    },
    selectAll(table, params) {
      return qb.select()
        .from(table)
        .where(params.filter ? params.filter + ' = @value' : '')
        .orderBy(params.order ? `${params.order} ${params.asc === 'true' ? 'ASC' : 'DESC'}` : '2')
        .offsetFetch(params.page ? (params.page - 1) * 20 : 0, 20)
        .exec(params.value ? [{ name: 'value', value: params.value }] : undefined)
    },
    insertInto(table, values) {
      return qb.insert(table, values)
        .exec()
    },
    update(table, values, id) {
      return qb.update(table, values)
        .where('Id =', id)
        .exec()
    },
    deleteFrom(table, id) {
      return qb.delete(table)
        .where('Id =', id)
        .exec()
    }
  };
}