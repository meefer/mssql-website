var express = require('express');
var path = require('path');
var handlebars = require('express-handlebars')
  .create({ defaultLayout: 'layout' });

var tableRoutes = require('./routes/tableRouter');
var mainRoutes = require('./routes/mainRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', mainRoutes);
app.use('/table/', tableRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler, will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status = err.status || 500);
    res.render('error', {
      message: `Error ${err.status} : ${err.message}`
    });
  });
}

// production error handler, no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status = err.status || 500);
  res.render('error', {
    message: `Error ${err.status} : Oops! Something gone wrong :(`
  });
});

module.exports = app;
