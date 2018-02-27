// Charger le core module mysql
var mysql = require("mysql");

// Charger le core module express et express-session
var express = require('express');
var session  = require('express-session');
var app = express();

// Charger le core module cookie parser
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");

// Charger le core module passport
var passport = require('passport');

var connectionsArray = [];

// Charger le core module http et socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Charger le core module connect-flash
var flash = require('connect-flash');

// charger le core module url pour faire passer des variables en utilisant URL
const url = require("url");

// read cookies (needed for auth)
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// set up ejs for templating our login and index
app.set('view engine', 'ejs');


// required for passport
// session secret
app.use(session({
	secret: 'razafinjatovoRindraAmbinintsoa'
 } ));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

// persistent login sessions
app.use(passport.session());

// use connect-flash for flash messages stored in session
app.use(flash());

// configuration ===============================================================
// pass passport for configuration
require('./config/passport')(passport);

app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/login'));

// routes ======================================================================
// charger une route et passer tous les variables
require('./app/routes.js')(app, io, connectionsArray, mysql, passport, url);
// require('./app/users.js')(app);

http.listen(3000, function(){
  console.log('listening on *:3000');
});
