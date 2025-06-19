// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin login/register
router.get('/login', (req, res) => res.render('admin/login'));
router.post('/login', adminController.login);

router.get('/register', (req, res) => res.render('admin/register'));
router.post('/register', adminController.register);

router.get('/postjob', adminController.isAuthenticated, (req, res) => {
  res.render('admin/postjob', { admin: req.session.admin });
});

// router.get('/dashboard', adminController.isAuthenticated, (req, res) => {
//   res.render('admin/dashboard', { admin: req.session.admin });
// });
router.get('/dashboard', adminController.isAuthenticated, adminController.dashboard);
// Handle form submission
router.post('/postjob', adminController.isAuthenticated, adminController.postJob);

// Show job list page
router.get('/jobs', adminController.isAuthenticated, adminController.showJobList);
// Job list
// router.get('/jobs', adminController.isAuthenticated, adminController.showJobList);

// Edit job form
router.get('/jobs/edit/:id', adminController.isAuthenticated, adminController.editJobForm);

// Update job
router.post('/jobs/edit/:id', adminController.isAuthenticated, adminController.updateJob);
// Delete job
router.post('/jobs/delete/:id', adminController.isAuthenticated, adminController.deleteJob);
router.post('/logout', adminController.logout);

router.get('/user_apply', adminController.isAuthenticated, adminController.userApply);


router.get('/approved/:id', adminController.isAuthenticated, adminController.approveApplication);
router.get('/reject/:id', adminController.isAuthenticated, adminController.rejectApplication);



module.exports = router;
