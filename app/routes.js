module.exports = function(app, io, connectionsArray, mysql, passport, url){

  var POLLING_INTERVAL = 3000, pollingTimer;
  var dbconfig = require('../config/database');
  var connection = mysql.createConnection(dbconfig.connection);

  app.get('/', isLoggedIn, function(req, res){
    res.render('index.ejs',
      {name: req.user}
    );
  });

  /*
   *
   * FROM github
   * This function loops on itself since there are sockets connected to the page
   *
   */

  var pollingLoop = function() {

    // Doing the database query
    var query = connection.query('SELECT * FROM ' + dbconfig.utable + ' where active = 1'),
      quiz_question = []; // this array will contain the result of our db query

    // setting the query listeners
    query
      .on('error', function(err) {
        // Handle error, and 'end' event will be emitted after this as well
        console.log(err);
        updateSockets(err);
      })
      .on('result', function(user) {
        // it fills our array looping on each user row inside the db
        quiz_question.push(user);
      })
      .on('end', function() {
        // loop on itself only if there are sockets still connected
        if (connectionsArray.length) {

          pollingTimer = setTimeout(pollingLoop, POLLING_INTERVAL);

          updateSockets({
            question: quiz_question
          });
        } else {

          console.log('The server timer was stopped because there are no more socket connections on the app')

        }
      });
  };

  // creating a new websocket to keep the content updated without any AJAX request
  io.sockets.on('connection', function(socket) {

    socket.on('clicked', function(data){
       console.log(data.id_quiz + " l'Utilisateur " + data.id_utilisateur + " éssai de répondre encore " + data.reponse);

       var point = 0;

       if(data.reponse == data.reponse_marina)
         point = data.point_par_question
        else point = 0;

      connection.query("SELECT id_quiz, reponse, id_utilisateur FROM resultats WHERE id_quiz = " + data.id_quiz + " AND id_utilisateur = " +
      data.id_utilisateur, function (err, results, fields) {
        if (err){
          // socket.emit('error', {message: "Vous avez déjà répondu à la question"});
          throw err;
        }
        if (results.length > 0){
          console.log('Fail pour ' + data.id_utilisateur + ': réponse déjà enregistré - ' + results[0].reponse);
          socket.emit('erreur', { some: 'Vous avez déjà répondu à cette question (' + results[0].reponse + ')'});
        }
        else {
          connection.query("INSERT INTO resultats (id_quiz, id_utilisateur, reponse, point) VALUES(" + data.id_quiz + ", " +  data.id_utilisateur + ", '" + data.reponse + "', " + point + ")", function (err, result) {
                 if (err) throw err;
                 else {
                   console.log('User added to database with ID: ' + data.id_utilisateur);
                   socket.volatile.emit('success', data);
                 }

           });
        }
      });
    });

    console.log('Number of connections:' + connectionsArray.length);
    // starting the loop only if at least there is one user connected
    if (!connectionsArray.length) {
      pollingLoop();
    }

    socket.on('disconnect', function() {
      var socketIndex = connectionsArray.indexOf(socket);
      console.log('socketID = %s got disconnected', socketIndex);
      if (~socketIndex) {
        connectionsArray.splice(socketIndex, 1);
      }
    });

    // console.log('A new socket is connected!');
    connectionsArray.push(socket);


  });

  var updateSockets = function(data) {
    // adding the time of the last update
    data.time = new Date();
    // console.log('Pushing new data to the clients connected ( connections amount = %s ) - %s', connectionsArray.length , data.time);
    // sending new data to all the sockets connected
    connectionsArray.forEach(function(tmpSocket) {
      tmpSocket.volatile.emit('notification', data);
    });
  };

  // ===========================================================================
  // THANKS ====================================================================
  // ===========================================================================
  // Thanks form after logout
  app.get('/thanks', function(req, res) {
		// render the page and pass in any flash data if it exists
    var moyenne = Math.round((req.query.result * 100)/req.query.total);
		res.render('thanks.ejs', { message: "Votre score est " + req.query.result + " / " + req.query.total + " ( " + moyenne + "%)"});
	});

  // ===========================================================================
	// LOGIN =====================================================================
	// ===========================================================================
	// show the login form
	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login_.ejs', { message: req.flash('loginMessage') });
	});

  // process the login form
	app.post('/login', passport.authenticate('local', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
            // session: false
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

  // ===========================================================================
  // LOGOUT ====================================================================
  // ===========================================================================
  app.get('/logout/(:id)', function(req, res) {
    // all is well, return successful user
    connection.query("UPDATE utilisateur SET loggedin = 0 where id_utilisateur = ?",
       req.params.id, function (err){
        if (err)
            return done(err);
            // render the page and pass in any flash data if it exists
            user_id = req.params.id;
      })

    connection.query("select count(id_utilisateur) AS count, sum(point_par_question) AS total, sum(point) AS result from resultats where id_utilisateur = ? ", req.params.id,
      function (err, rows, fields){
         console.log(rows[0].result + ": " + rows[0].total);

         res.redirect(url.format({
           pathname:"/thanks/",
           query: {
              "user_id": req.params.id,
              "total": rows[0].total,
              "result": rows[0].result,
              "valid": rows[0].count
            }
         }));

       });
    req.logout();
  });

    // route middleware to make sure
  function isLoggedIn(req, res, next) {

  	// if user is authenticated in the session, carry on
  	if (req.isAuthenticated())
  		return next();

  	// if they aren't redirect them to the home page
  	res.redirect('/login');
  }

};
