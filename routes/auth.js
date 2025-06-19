const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for home page or login page
router.get('/', (req, res) => {
  res.render('login');  
});

// Example login route

router.get('/register', (req, res) => {
  res.render('register'); 
});

router.post('/register', authController.registerUser);

// router.get('/dashboard', (req, res) => {
//   res.render('dashboard'); 
// });

router.post('/login', authController.login);

router.get('/dashboard', authController.dashboard);

// router.get('/dashboard', (req, res) => {
//   res.render('dashboard'); 
// });

// POST logout
router.post('/logout', authController.logout);

module.exports = router;  
