const express = require('express');
const passport = require('passport');
const router = express.Router();
const Admin = require('../mongodb/Models/admin.js');
const bcrypt = require('bcrypt');

// Register a new admin
/*
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('register router:', username, password)
    // Check if the username is already taken
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = await Admin.create({username, password: hashedPassword,});
    console.log('new account:\n',username, password, hashedPassword)

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});*/

// classResponse Login
router.post('/classResponse-login', passport.authenticate('local'), (req, res) => {
  res.status(200).json({ message: 'classResponse login successful', id: req.user._id });
});

// Admin Login
router.post('/admin-login', passport.authenticate('local'), (req, res) => {
  res.status(200).json({ message: 'Admin login successful', });
});

// Admin Login
router.post('/admin-register', passport.authenticate('local', {
  successRedirect: '/admin/dashboard',
  failureRedirect: '/admin/login',
  failureFlash: true
}));

// Logout (for both user and admin)
router.post('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.status(200).json({ isLoggedOut: true });
  });
});

// Route to check authentication status
router.get('/status', (req, res) => {
  console.log(req.user)
  if(!req.user) { return res.status(401).json({ message: "not auth" }) }
  res.status(200).json({ isAuthenticated: true, isAdmin: req.user?.isAdmin });
});


module.exports = router;