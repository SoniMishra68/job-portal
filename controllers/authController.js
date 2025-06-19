const db = require('../db');

exports.registerUser = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.send('All fields are required.');
  }
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.send('Error saving user.');
    }
    res.redirect('/login');
  });
};

// exports.login = (req, res) => {
//   const { email, password } = req.body;
//   //console.log('Input email:', req.body.email);
//   db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
//     if (err) throw err;
//     //console.log(results.length);
//     if (results.length > 0) {
//       const user = results[0];
//       if (password === user.password) {
//         req.session.user = {
//           id: user.id,
//           email: user.email,
//           name: user.name
//         };
//         res.redirect('/dashboard');  
//       } else {
//         res.status(400).send('Invalid credentials');
//       }

//     } else {
//       res.status(400).send('User not found');
//     }
//   });
// };


// In AuthController login route

exports.login = (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];

      if (password === user.password) {
        // Set the session with user details
        req.session.user = {
          id: user.id,
          email: user.email,
          name: user.name
        };
        // Redirect to jobs page or dashboard
        return res.redirect('/dashboard');
      } else {
        return res.status(400).send('Invalid credentials');
      }
    } else {
      return res.status(400).send('User not found');
    }
  });
};

// Logout logic
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/');  
  });
};

exports.dashboard = (req, res, next) => {
  const user = req.session.user;
  const userId = user.id;
  // Query to get total jobs
  const totalJobsSql = 'SELECT COUNT(*) AS total_jobs FROM post_jobs';
  const applicationsSql = 'SELECT COUNT(*) AS total_application FROM applications WHERE user_id = ? AND is_approved = 1';
  const totalviewProfileSql = 'SELECT COUNT(*) AS total_papplication FROM applications WHERE is_approved IS NOT NULL AND user_id = ?';

  // Execute the first query to get total jobs
  db.query(totalJobsSql, (err, totalJobsResults) => {
    if (err) {
      return res.status(500).send('Server Error while fetching total jobs');
    }
    // Get total jobs count
    const totalPosts = totalJobsResults[0].total_jobs;
    // Now fetch total applications data
    db.query(applicationsSql, [userId], (err, applicationsResults) => {
      if (err) {
        return res.status(500).send('Server Error while fetching total applications');
      }
      const totalApplication = applicationsResults[0].total_application;
      // Fetch total view profiles (approved applications)
      db.query(totalviewProfileSql, [userId], (err, viewProfileResults) => {
        if (err) {
          return res.status(500).send('Server Error while fetching approved applications');
        }
        const totalviewProfile = viewProfileResults[0].total_papplication;
        // Render the dashboard with the fetched data
        res.render('dashboard', { 
          user: req.session.user, 
          totalpost: totalPosts, 
          totalApplication: totalApplication, 
          totalviewProfile: totalviewProfile 
        });
      });
    });
  });
};


