const db = require('../db');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Admin Registration
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.send('All fields are required.');
  }

  // Hash the password before saving
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.send('Error hashing password.');
    const sql = 'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        return res.send('Error saving admin.');
      }
      res.redirect('/admin/login');
    });
  });
};

// Admin Login
exports.login = (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM admins WHERE email = ?', [email], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const admin = results[0];
      bcrypt.compare(password, admin.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          req.session.admin = admin; // store admin session
          res.redirect('/admin/dashboard');
        } else {
          res.send('Incorrect password');
        }
      });
    } else {
      res.send('Admin not found');
    }
  });
};

// Admin Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/admin/login');
  });
};

// Middleware to check if admin is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next();
  }
  res.redirect('/admin/login');
};

exports.postJob = (req, res) => {
    const { title, description, company, requirement_for, location } = req.body;
    const sql = 'INSERT INTO post_jobs (title, description, company,requirement_for,location) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [title, description, company, requirement_for, location], (err, result) => {
      if (err) {
        console.error('Error inserting job:', err);
        return res.status(500).send('Something went wrong');
      }
      res.redirect('/admin/jobs'); // or wherever you want to go after posting
    });
  };

  exports.showJobList = (req, res) => {
    const sql = 'SELECT * FROM post_jobs ORDER BY id DESC';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching jobs:', err);
        return res.status(500).send('Server error');
      }
      res.render('admin/jobs', { admin: req.session.admin, jobs: results });
    });
  };

  // Show edit form
  exports.editJobForm = (req, res) => {
    const jobId = req.params.id;
    const sql = 'SELECT * FROM post_jobs WHERE id = ?';
    db.query(sql, [jobId], (err, results) => {
      if (err) return res.status(500).send('Server Error');
      res.render('admin/editjob', { admin: req.session.admin, job: results[0] });
    });
  };
  
  // Handle update
  exports.updateJob = (req, res) => {
    const { title, company, description, requirement_for, location } = req.body;
    const jobId = req.params.id;
    const sql = 'UPDATE post_jobs SET title = ?, company = ?, description = ?, requirement_for = ?, location = ? WHERE id = ?';
    db.query(sql, [title, company, description, jobId, requirement_for, location], (err) => {
      if (err) return res.status(500).send('Error updating job');
      res.redirect('/admin/jobs');
    });
  };
  
  // Handle delete
  exports.deleteJob = (req, res) => {
    const jobId = req.params.id;
    const sql = 'DELETE FROM post_jobs WHERE id = ?';
    db.query(sql, [jobId], (err) => {
      if (err) return res.status(500).send('Error deleting job');
      res.redirect('/admin/jobs');
    });
  };

  exports.userApply = (req, res) => {

     const query = `
        SELECT applications.*, users.name AS user_name, users.email AS user_email, post_jobs.title AS jobtitle
        FROM applications
        LEFT JOIN users ON applications.user_id = users.id
        LEFT JOIN post_jobs ON applications.job_id = post_jobs.id`;
    
      db.query(query, (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          return res.status(500).send('Server Error');
        }
        res.render('admin/user_apply', { applications: results });
      });
  };

  exports.approveApplication = (req, res) => {
    const id = req.params.id;
    const sql = 'UPDATE applications SET is_approved = 1 WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error approving application');
      }
      res.redirect('/admin/user_apply'); // or wherever your listings are shown
    });
  };
  
  exports.rejectApplication = (req, res) => {
    const id = req.params.id;
    const sql = 'UPDATE applications SET is_approved = 0 WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error rejecting application');
      }
      res.redirect('/admin/user_apply');
    });
  };

 
  

  exports.dashboard = (req, res, next) => {
    // Query to get total jobs
    const totalJobsSql = 'SELECT COUNT(*) AS total_jobs FROM post_jobs';
    const applicationsSql = 'SELECT COUNT(*) AS total_application FROM applications';  
    const totalviewProfileSql = 'SELECT COUNT(*) AS total_papplication FROM applications WHERE is_approved IS NOT NULL';
  
    // Execute the first query to get total jobs
    db.query(totalJobsSql, (err, totalJobsResults) => {
      if (err) {
        return res.status(500).send('Server Error while fetching total jobs');
      }
      // Get total jobs count
      const totalPosts = totalJobsResults[0].total_jobs;
  
      // Now fetch total applications data
      db.query(applicationsSql, (err, applicationsResults) => {
        if (err) {
          return res.status(500).send('Server Error while fetching total applications');
        }
        const totalApplication = applicationsResults[0].total_application;
  
        // Fetch total view profiles (approved applications)
        db.query(totalviewProfileSql, (err, viewProfileResults) => {
          if (err) {
            return res.status(500).send('Server Error while fetching approved applications');
          }
          const totalviewProfile = viewProfileResults[0].total_papplication;
  
          // Render the dashboard with the fetched data
          res.render('admin/dashboard', { 
            admin: req.session.admin, 
            totalpost: totalPosts, 
            totalApplication: totalApplication, 
            totalviewProfile: totalviewProfile 
          });
        });
      });
    });
  };
  
  
  