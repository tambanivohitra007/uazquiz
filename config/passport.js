// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');

// Charger la configuration dans de la base de donnée
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================

    passport.use(new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // Passing back the entire request to the callback
        },
        function(req, id_utilisateur, password, done) {
            connection.query("SELECT * FROM utilisateur WHERE id_utilisateur = ?",[id_utilisateur], function(err, rows){
                if (err) return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Cet utilisateur n\'existe pas.')); // req.flash is the way to set flashdata using connect-flash
                }
                if (rows[0].loggedin == 1) {
                  return done(null, false, req.flash('loginMessage', 'Cet utilisateur est déjà connecté.'));
                }

                // if the user is found but the password is wrong
                if (password != rows[0].mot_de_passe)
                    return done(null, false, req.flash('loginMessage', 'Mot de passe érroné.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                connection.query("UPDATE utilisateur SET loggedin = 1 where id_utilisateur = ?",
                  [id_utilisateur], function (err){
                    if (err)  return done(err);
                  })

                return done(null, rows[0]);
            });
        })
    );

    // =========================================================================
    // Passport session configuration ==========================================
    // =========================================================================
    // Serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id_utilisateur);
    });

    // Deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM utilisateur WHERE id_utilisateur = ?",[id], function(err, rows){
            done(err, rows[0]);
        });
    });
};
