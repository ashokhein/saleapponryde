var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var UserAssociation = mongoose.model('UserAssociation')
var auth = require('../auth');
 
router.get('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }
    return res.json({user: user.toProfileJSON()});
  }).catch(next);
});

router.get('/user/profile/:id', auth.required, function(req, res, next){
  User.findOne({ _id: req.params.id}).then(function(user){
    if(!user){ return res.sendStatus(401); }
    return res.json({user: user.toProfileJSON()});
  }).catch(next);
});

router.put('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }
    return user.save().then(function(){
      return res.json({user: user.toProfileJSON()});
    });
  }).catch(next);
});

router.post('/users/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }
    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/user', function(req, res, next){
  var user = new User();
  user.username = req.body.user.username;
  user.firstName = req.body.user.firstName;
  user.lastName = req.body.user.lastName;
  user.email = req.body.user.email;
  user.role = req.body.user.role;
  user.setPassword(req.body.user.password);
  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

router.get('/userAssociation',auth.required,function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }
    UserAssociation.find({ userid : req.payload.id.toString()}).then(function(useras){
      let usermap =[]
      let usercount = 0
      useras.forEach(usera => {
        usermap.push(usera.email)
        usercount++
      })
      var limit = 20;
      var offset = 0;
    
      if(typeof req.query.limit !== 'undefined'){
        limit = req.query.limit;
      }
    
      if(typeof req.query.offset !== 'undefined'){
        offset = req.query.offset;
      }
      Promise.all([
        User.where({ email: { $in: usermap }})
        .skip(Number(offset))
        .limit(Number(limit))
        .sort({createdAt: 'desc'}).exec()
      ]).then((results) => {
          const users = results[0]
          return res.json({
              users: users.map( user => {
                return user.toProfileJSON()
              }),
              count : usercount
            }
          )
        })
        .catch((error) => {
          console.warn(error);
          next()
        })    
    })
  }).catch(next)
});

router.post('/userAssociation',auth.required,function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }
    UserAssociation.find({ userid: req.payload.id, email: req.body.email}).then(function(user){
      if(user.length === 0 ) { 
        let userAssociation = new UserAssociation()
        userAssociation.userid = req.payload.id
        userAssociation.email = req.body.email
        userAssociation.save(function(){
        return res.json({ message: req.body.email +" is associated with " + userAssociation.userid })
        })
      } else {
      return res.json({ error: "User already associated"})
      }
    }).catch(next)
  }).catch(next)
});

router.get("/allusers",auth.required, function(req,res,next){
  if(req.payload.role !== "superadmin") {
    return res.sendStatus(401);
  } 
  User.find({}).then(function(users){
    return res.json({
      users: users.map( user => {
        return user.toProfileJSON()
      })
    })
  })
})

module.exports = router;
