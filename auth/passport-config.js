var LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
var passport = require('passport');


const ClassResponsible = require('../mongodb/Models/classResponsible.js');
const Admin = require('../mongodb/Models/admin.js');

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  let user = null;
  // Check if it's an admin or a regular user
  user = await Admin.findOne({ username });
  if (user === null) {
    user = await ClassResponsible.findOne({ username });
    if (user === null) {
      return cb(null, false, { message: 'No user with that username' });
    } 
  }
  try {
    if (bcrypt.compare(password, user.password)) {
      console.log('passport.use: ', user)
      return cb(null, user);
    } else {
      return cb(null, false, { message: 'Password incorrect' });
    }
  } catch (e) {
    return cb(e);
  }
}));

passport.serializeUser((user, done) => {
 console.log('serializeUser: ', user, user.id)
  done(null, user);
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await Admin.findById(id);
    console.log('deserializeUser ()()()() test: ', id)
    if (!user) {
      const classResponsibleUser = await ClassResponsible.findById(id);
      if (!classResponsibleUser) {
        console.log('============deserializeUser faild:', classResponsibleUser)
        return done(null, false);
      }
      console.log('============deserializeUser succeed:', classResponsibleUser)
      return done(null, classResponsibleUser);
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;