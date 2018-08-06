var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt= require("jsonwebtoken")
var secret= require("../config").secret;

var Schema= mongoose.Schema;

var UserAssociation = new Schema({
  userid: { type : String},
  email: { type : String }
})


// User Schema
var UserSchema= new Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'username is invalid'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'email is invalid'], index: true},
  firstName: String,
  lastName: String,
  hash: String,
  salt: String,
  role: { type: String }
}, { timestamps : true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

//Validate the password
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
 var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
 return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    role: this.role,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
  };
};

UserSchema.methods.toProfileJSON = function(){
  return {
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    role: this.role,
    email: this.email,
    id: this._id
  };
};

mongoose.model('User',UserSchema);
mongoose.model('UserAssociation',UserAssociation);
