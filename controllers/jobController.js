const db = require('../db');
const path = require('path');
const session = require('express-session');

// exports.viewJobs = (req, res) => {
//   const query = "SELECT * FROM post_jobs ORDER BY created_at DESC";
//   db.query(query, (err, results) => {
//     if (err) return res.status(500).send('Database error');
//     // Pass the session user data to the view
//     res.render('jobs/apply', { jobs: results, user: req.session.user });
//   });
// };

exports.viewJobs = (req, res) => {
  const { company, location } = req.query;
  let query = "SELECT * FROM post_jobs WHERE 1";
  const params = [];
  if (company) {
    query += " AND company LIKE ?";
    params.push(`%${company}%`);
  }
  if (location) {
    query += " AND location LIKE ?";
    params.push(`%${location}%`);
  }
  query += " ORDER BY created_at DESC";
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).send('Database error');
    res.render('jobs/apply', {
      jobs: results,
      user: req.session.user,
      req
    });
  });
};

exports.postJobPage = (req, res) => {
  res.render('jobs/postJob');
};

exports.postJob = (req, res) => {
  const { title, description, location } = req.body;
  const resume = req.file ? req.file.filename : null;

  if (!title || !description || !location) {
    return res.render('jobs/postJob', { error: 'All fields are required' });
  }
  const query = "INSERT INTO jobs (title, description, location, resume) VALUES (?, ?, ?, ?)";
  db.query(query, [title, description, location, resume], (err) => {
    if (err) return res.status(500).send('Job creation failed');
    res.redirect('/jobs');
  });
};

exports.deleteJob = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM jobs WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) return res.status(500).send('Delete failed');
    res.redirect('/jobs');
  });
};

// Show edit form
exports.editJobForm = (req, res) => {
  const jobId = req.params.id;
  const sql = 'SELECT * FROM jobs WHERE id = ?';
  db.query(sql, [jobId], (err, results) => {
    if (err) return res.status(500).send('Database error');
    if (!results.length) return res.status(404).send('Job not found');
    res.render('jobs/editJob', { job: results[0] });
  });
};

// Update job
exports.updateJob = (req, res) => {
  const jobId = req.params.id;
  const { title, description, location } = req.body;
  const sql = 'UPDATE jobs SET title = ?, description = ?, location = ? WHERE id = ?';
  db.query(sql, [title, description, location, jobId], (err) => {
     if (err) return res.status(500).send('Database update error');
      res.redirect('/jobs');
  });
};

// Update job
exports.editApplication = (req, res) => {
  const applyid = req.params.id;
  res.render('jobs/application', {applyid: applyid });
}
  // controllers/jobController.js
exports.added = (req, res) => {
  const applyid = req.body.job_id;
  const user = req.session.user;
  const user_id = user.id;

  const { job_id, current_company, current_ctc, expected_ctc, total_experience, current_location } = req.body;
  const resume = req.file ? req.file.filename : null; 
  if (!current_company || !current_ctc || !expected_ctc) {
      res.render('jobs/application', {
          applyid,
          error: 'All fields are required'
      });
  }
  const query = `INSERT INTO applications 
      (user_id, job_id, current_company, current_ctc, expected_ctc, total_experience, current_location, resume) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(query, [ job_id, user_id, current_company, current_ctc, expected_ctc, total_experience, current_location, resume], (err) => {
      if (err) {
        console.error('MySQL Insert Error:', err); // Add this line
        return res.status(500).send('creation failed');
      }
     // return res.render('jobs/application', { applyid });
        res.render('jobs/application', { applyid });
  });
};

// exports.userApplication = (req, res) => {
//   res.render('jobs/user-application');
// };

exports.userApplication = (req, res) => {
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
    res.render('jobs/user-application', { applications: results });
  });
};

exports.applicationDelete = (req, res) => {
  const { id } = req.params;
  const deleteQuery = "DELETE FROM applications WHERE id = ?";
  db.query(deleteQuery, [id], (err) => {
    if (err) return res.status(500).send('Delete failed');
    // Now fetch the updated applications
    const fetchQuery = `
    SELECT applications.*, users.name AS user_name, users.email AS user_email, post_jobs.title AS jobtitle
    FROM applications
    LEFT JOIN users ON applications.user_id = users.id
    LEFT JOIN post_jobs ON applications.job_id = post_jobs.id`;
    db.query(fetchQuery, (err, results) => {
      if (err) return res.status(500).send('Failed to fetch updated applications');
      res.render('jobs/user-application', { applications: results });
    });
  });
}

exports.viewprofile  = (req, res) => {
  const user = req.session.user;
  const id = user.id;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send('Database error');
    if (!results.length) return res.status(404).send('data not found');
   // res.render('jobs/editJob', { user: results[0] });
  // console.log(results[0]);
    res.render('jobs/profile', { user: results[0] });
  });
}

// exports.updateprofile = async (req, res) => {
//   try {
//     const user = req.session.user;
//     const userId = user.id; // FIX: Correct variable name
//     const { name, email } = req.body;
//     console.log(req.body);
//     let profileImage = user.profile_image; // FIX: Use session's user, not req.user
//     if (req.file) {
//       const oldPath = `./uploads/profiles/${profileImage}`;
//       if (profileImage && fs.existsSync(oldPath)) {
//         fs.unlinkSync(oldPath);
//       }
//       profileImage = req.file.filename;
//     }

//     await User.update(
//       { name, email, profile_image: profileImage },
//       { where: { id: userId } }
//     );

//     const updatedUser = await User.findByPk(userId);
//     req.session.user = updatedUser; // optional: refresh session
//     res.render('jobs/profile', { user: updatedUser, message: 'Profile updated successfully!' });
//   } catch (error) {
//     console.error('Update error:', error);
//     res.render('jobs/profile', {
//       user: req.session.user || {}, // FIX: avoid undefined
//       message: 'Error updating profile.'
//     });
//   }
// };


exports.updateprofile = (req, res) => {
  const user = req.session.user;
  const userId = user.id;

  const { name, email } = req.body;
  const profile_image = req.file ? req.file.filename : user.profile_image; // Fallback to old image if not updated

  if (!name || !email) {
    return res.render('jobs/profile', { user, message: 'Profile not updated: Name and Email are required' });
  }

  const sql = 'UPDATE users SET name = ?, email = ?, profile_image = ? WHERE id = ?';
  db.query(sql, [name, email, profile_image, userId], (err) => {
    if (err) return res.status(500).send('Database update error');
    // Fetch updated user
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) return res.status(500).send('Error fetching updated user');
      const updatedUser = result[0];
      req.session.user = updatedUser; // Update session data
      res.render('jobs/profile', { user: updatedUser, message: 'Profile updated successfully' });
    });
  });
};










