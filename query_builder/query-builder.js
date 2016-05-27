const sql = require('mssql');
const EventEmitter = require('events');

module.exports = (config) => new QueryBuilder(config);

class QueryBuilder {
  constructor(config) {
    this.connect = sql.connect(config)
      .catch(err => { throw err; });
    this._templates = {
      select: 'SELECT @dist @top @columns FROM @tables @expr.where @expr.group_by @expr.having @expr.order_by @expr.offset',
      insert: 'INSERT INTO @tables (@columns) VALUES (@values)',
      update: 'UPDATE @tables SET @colEqValPairs @expr.where',
      delete: 'DELETE FROM @tables @expr.where'
    };
    this.mode = 'select';
    this.tables = this.columns = this.values = this.colEqValPairs = this.dist = this.top = '';
    this.expr = {
      where: '',
      group_by: '',
      having: '',
      order_by: '',
      offset: ''
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
  
  distinct() {
    this.dist = 'DISTINCT';
    return this;
  }
  
  top(number) {
    this.top = `TOP ${number}`.trim();
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
  
  groupBy (...columns) {
    this.expr.group_by = columns.join(',');
    return this;
  } // add { col1: 'ASC', col2: 'DESC' }
  
  orderBy(...columns) {
    this.expr.order_by = columns.join(',');
    return this;
  }
  
  having() {
    return this;
  }
  
  offsetFetch(offsetNumber, fetchNumber) {
    this.expr.offset = `${offsetNumber} ROWS FETCH NEXT ${fetchNumber} ROWS ONLY`;
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

  delete(fromTable) {
    this.mode = 'delete';
    this.table = fromTable;
    return this;
  }

  update(table, values) {
    this.mode = 'update';
    this.tables = table;
    let keyValueArr = [];
    let keys = Object.keys(values);
    keys.forEach((key) => {
      let value = values[key];
      if (typeof value === 'string') value = `N'${value}'`;
      keyValueArr.push(`${key}=${value}`);
    });
    this.colEqValPairs = keyValueArr.join(',');
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

  _where(delimiter, raw = '', ...args) {
    if (delimiter) this.expr.where += ` ${delimiter} `;
    this.expr.where += `${raw} ${args[0] || ''} ${args[1] || ''}`.trim();
    return this;
  }

  where(raw, ...args) {
    this.expr.where = '';
    return _where('', raw, ...args);
  }
  or(raw, ...args) {
    return _where('OR', raw, ...args);
  }
  and(raw = '', ...args) {
    return _where('AND', raw, ...args);
  }

  join(tableMap) { // tableMap => [ 'Person AS p': false, ... ] where 'false' stands for 'do not reverse'
    let prevAlias = '', prevTableName = '';
    for (let [table, reversed] of tableMap) {
      let [tableName, , alias] = table.split(' ');
      if (!this.tables) {
        this.tables = table;
      }
      else {
        if (!reversed) {
          this.tables += ` JOIN ${table} ON ${prevAlias}.Id = ${alias}.${prevTableName}Id`;
        }
        else {
          this.tables += ` JOIN ${table} ON ${alias}.Id = ${prevAlias}.${tableName}Id`;
        }
      }
      [prevAlias, prevTableName] = [alias, tableName];
    }
    return this;
  }

  _cleanup() {
    this.mode = 'select';
    this.tables = this.columns = this.values = this.colEqValPairs = this.dist = this.top = '';
    this.expr = {};
  }
  
  exec() {
    let queryString = this._interpolate(this._templates[this.mode]);
    this._cleanup();
    return this.connect.then(() => {
      let fn = null, req = new sql.Request();
      if (this.mode !== 'select')
        fn = () => { return Promise.resolve(req.rowsAffected); };
      return req.query(queryString).then(fn);
    });
  }
}