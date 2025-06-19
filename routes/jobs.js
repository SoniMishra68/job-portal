const express = require('express');
const router = express.Router();
const multer = require('multer');
const jobController = require('../controllers/jobController');

const storage = multer.diskStorage({
  destination: './uploads/resumes',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
const storageProfile = multer.diskStorage({
  destination: './uploads/profile_images',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const uploadProfile = multer({ storage: storageProfile });

//router.get('/', jobController.viewJobs);
router.get('/apply', jobController.viewJobs);
router.get('/post', jobController.postJobPage);
router.post('/post', upload.single('resume'), jobController.postJob);
router.get('/delete/:id', jobController.deleteJob); 
router.get('/edit/:id', jobController.editJobForm);
router.post('/update/:id', jobController.updateJob);
router.get('/application/:id', jobController.editApplication);
router.post('/added', upload.single('resume'), jobController.added);
router.get('/user-application', jobController.userApplication);

router.get('/profile', jobController.viewprofile);
//router.post('/updateprofile', jobController.updateprofile);
router.post('/updateprofile', uploadProfile.single('profile_image'), jobController.updateprofile);
router.get('/application-delete/:id', jobController.applicationDelete);
module.exports = router;
