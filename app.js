var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan')
var methodOverride = require('method-override');

var routes = require('./routes/router');

var app = express();


app.use("/public", express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.use('/', routes);

app.listen(4200);
console.log('Starting at port 4200');