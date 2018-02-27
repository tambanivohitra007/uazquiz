/**
 * Database special for uazquiz
 */

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin"
});

connection.query('CREATE DATABASE testquiz');

connection.query('USE testquiz');

connection.query('CREATE TABLE `quiz` ( \
  `id_quiz` int(5) NOT NULL, \
  `question` varchar(255) DEFAULT NULL, \
  `point_par_question` int(2) DEFAULT 2, \
  `reponse` varchar(255) DEFAULT NULL,\
  `A` varchar(255) DEFAULT NULL, \
  `B` varchar(255) DEFAULT NULL, \
  `C` varchar(255) DEFAULT NULL, \
  `D` varchar(255) DEFAULT NULL, \
  `active` int(1) DEFAULT 0, PRIMARY KEY (`id_quiz`))');

connection.query(
  'CREATE TABLE `utilisateur` ( \
  `id_utilisateur` int(5) NOT NULL, \
  `noms` varchar(250) DEFAULT NULL, \
  `departement` char(4) DEFAULT NULL, \
  `mot_de_passe` varchar(7) DEFAULT NULL, \
  `loggedin` int(1) DEFAULT 0, \
  PRIMARY KEY (`id_utilisateur`) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8');

connection.query(
  'CREATE TABLE `resultats` ( \
  `id_quiz` int(5) NOT NULL, \
  `id_utilisateur` int(5) NOT NULL, \
  `point_par_question` int(1) DEFAULT 0, \
  `reponse` char(1) DEFAULT NULL, \
  `point` int(1) DEFAULT 0, \
  `date_entry` datetime DEFAULT CURRENT_TIMESTAMP, \
  PRIMARY KEY (`id_quiz`,`id_utilisateur`), \
  KEY `fk_user` (`id_utilisateur`), \
  CONSTRAINT `fk_id` FOREIGN KEY (`id_quiz`) REFERENCES `quiz` (`id_quiz`), \
  CONSTRAINT `fk_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`) \
) ENGINE=InnoDB DEFAULT CHARSET=utf8');


console.log('Success: Database Created!')

connection.end();
