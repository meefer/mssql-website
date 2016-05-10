const sql = require('mssql');
const EventEmitter = require('events');

module.exports = (config) => new QueryBuilder(config);

class QueryBuilder {
  constructor(config) {
    this.connect = sql.connect(config)
      .catch(err => { throw err; });
    this._templates = {
      select: 'SELECT @columns FROM @tables @expr.where @expr.group_by @expr.having @expr.order_by',
      insert: 'INSERT INTO @tables (@columns) VALUES (@values)',
      update: 'UPDATE @tables SET @colEqValPairs @expr.where',
      delete: 'DELETE FROM @tables @expr.where'
    };
    this.mode = 'select';
    this.tables = this.columns = this.values = this.colEqValPairs = '';
    this.expr = {
      where: '',
      group_by: '',
      having: '',
      order_by: ''
    };
  }

  select(...args) {
    this.mode = 'select';
    if (!args.length) this.columns = '*'
    else {
      this.columns = args.join(',');
    }
    return this;
  }

  from(tableName) {
    if (!tableName) throw new Error('Table name must be passed as first function parameter!');
    else {
      this.tables = tableName;
    }
    return this;
  }

  withSchema(schemaName = 'dbo') {
    if (!schemaName) throw new Error('Schema name must be passed as first function parameter!');
    else {
      this.schema = schemaName;
    }
    return this;
  }

  insert(into, values) { // values => { column1: value1, column2: value2 }
    this.mode = 'insert';
    this.tables = into;
    let keys = Object.keys(values);
    this.columns = keys.join(',');
    this.values = keys.map((key) => {
      if (typeof values[key] === 'string') {
        return `N'${values[key]}'`;
      }
      return values[key];
    }).join(',');
    return this;
  }

  _interpolate(template) {
    return template.replace(/@((\w|\.)+)/g, (_, prop) => {
      if (~prop.indexOf('.')) {
        var propName = prop.replace(/\w+\./, '');
        if (this.expr[propName])
          return `${propName.replace(/_/g, ' ').toUpperCase()} ${this.expr[propName]}`;
        return '';
      };
      return this[prop];
    }).trim();
  }

  exec() {
    let queryString = this._interpolate(this._templates[this.mode]);
    return this.connect.then(() => {
      let fn = null, req = new sql.Request();
      if (this.mode !== 'select')
        fn = () => { return Promise.resolve(req.rowsAffected); };
      return req.query(queryString).then(fn);
    });
  }
}