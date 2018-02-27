module.exports = function(app){

  // ADD NEW USER POST ACTION
  app.post('/add/A', function(req, res, next){
  // 	req.assert('id_utilisateur', 'Name is required').notEmpty()           //Validate name
  // 	req.assert('reponse', 'Age is required').notEmpty()             //Validate age
  //
  //     var errors = req.validationErrors()
  //
  //     if( !errors ) {   //No errors were found.  Passed Validation!

  		/********************************************
  		 * Express-validator module

  		req.body.comment = 'a <span>comment</span>';
  		req.body.username = '   a user    ';

  		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
  		req.sanitize('username').trim(); // returns 'a user'
  		********************************************/
  		// var user = {
  		// 	name: req.sanitize('name').escape().trim(),
  		// 	age: req.sanitize('age').escape().trim(),
  		// 	email: req.sanitize('email').escape().trim()
  		// }

      var resultats = {
        id_utilisateur: 'id',
        id_quiz: 'quiz',
        reponse: ''
      }

  		req.getConnection(function(error, conn) {
  			conn.query('INSERT INTO resultats (id_quiz,id_utilisateur) VALUES ?', resultats, function(err, result) {
  				//if(err) throw err
  				if (err) {
  					req.flash('error', err)

  					// render to views/user/add.ejs
            res.render('index.ejs');

  				} else {
  					// req.flash('success', 'Data added successfully!')
  					res.redirect('/')
  				}
  			})
  		})
  })
}
