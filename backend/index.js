
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const members = require('./members');
const uuid = require('uuid');
const mysql = require('mysql');
// const socketIo = require('socket.io');
// const http = require('http');

// const server = http.createServer(app);
// const io = socketIo(server);

app.use(express.json()); 
app.use(express.urlencoded({extended:false}));
app.use(cors({
    origin: '*', //* allows requests from any device
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));

app.get('/',(req,res)=>{
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
          console.error('Error executing the SELECT query:', err); 
        }else{
         console.log(`Data retrieved and displayed @ http://localhost:${PORT}/`);
        res.json(result);
        }
        }
    );
});

const db = mysql.createConnection({
  host:'localhost',
  user:'busari007',
  password:'obey4show',
  database:'test'
});

db.connect((err)=>{
    if(err){
        console.error('Error connecting to database',err)
    }else{
        console.log("Successfully connected to database");
    }
});


// io.on('connection', (socket) => {
//   console.log('A client connected');

//   // Handle boundary dimension updates
//   socket.on('updateBoundaryDimensions', (dimensions) => {
//       // Broadcast the updated dimensions to all connected clients
//       io.emit('boundaryDimensions', dimensions);
//   });

//   socket.on('disconnect', () => {
//       console.log('A client disconnected');
//   });
// });


//query to create student account
app.post('/register',(req,res)=>{
    const newMember = req.body;
    db.query('INSERT INTO users SET ?',newMember,(err,result)=>{
        if(err){
            console.error('Error inserting data:',err)
            res.status(500).send('Error inserting data into database');
        }else{
            console.log("User created:",result);
            res.send("User created successfully");
        }
    });

  members.push(newMember);

});

//query for student log in
app.post('/logIn',(req,res)=>{  
  const { matric_num, password } = req.body;

   // Query the database for user authentication
   const query = 'SELECT * FROM users WHERE matric_num = ? AND password = ?';
   db.query(query, [matric_num, password], (err, results) => {  //matricnum and password act as array values that will replace ? in the sql query query variable
     if (err) {
       console.error('Database query error:', err);
       res.status(500).json({ success: false, message: 'Internal server error' });
     } else {
       // Check if a user with matching credentials was found
       if (results.length > 0) {
         const user = results[0];
         res.json({ matric_num: user.matric_num, password:user.password, username: user.username, success: true }); 
       } else {
         res.status(401).json({ success: false, message: 'Invalid matric_num or password' });
       }
      }
   });
});

//query to create lecturer account
app.post('/lectRegister',(req,res)=>{
  const newMember = req.body;
  db.query('INSERT INTO lecturers SET ?',newMember,(err,result)=>{
      if(err){
          console.error('Error inserting data:',err)
          res.status(500).send('Error inserting data into database');
      }else{
          console.log("Lecturer created:",result);
          res.send("Lecturer created successfully");
      }
  });

members.push(newMember);

});

//query to log lectueres
app.post('/lectLogIn',(req,res)=>{
  const { lect_username, lect_password } = req.body;

   // Query the database for user authentication
   const query = 'SELECT * FROM lecturers WHERE lect_username = ? AND l\ect_password = ?';
   db.query(query, [lect_username, lect_password], (err, results) => {  //matricnum and password act as array values that will replace ? in the sql query query variable
     if (err) {
       console.error('Database query error:', err);
       res.status(500).json({ success: false, message: 'Internal server error' });
     } else {
       // Check if a user with matching credentials was found
       if (results.length > 0) {
         const user = results[0];
         res.json({ lect_password:user.lect_password, lect_username: user.lect_username, lect_id: user.lect_id, success: true }); 
       } else {
         res.status(401).json({ success: false, message: 'Invalid matric_num or password' });
       }
      }
   });
});

//query for creating courses
app.post('/courses', (req, res) => {
  const newCourse = req.body;
  db.query('INSERT INTO courses SET ?', newCourse, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err)
      res.status(500).send('Error inserting data into the database');
    } else {
      console.log('Course created:', result);
      res.send('Course created successfully');
    }
  });
});

// Query for fetching all courses
app.get('/courses', (req, res) => {
  db.query('SELECT * FROM courses', (err, result) => {
    if (err) {
      console.error('Error executing the SELECT query:', err);
      res.status(500).send('Error retrieving data from the database');
    } else {
      res.json(result);
    }
  });
});

//query to get lecturers id and course_codes offered by the lecturer
app.post('/lectId', (req, res) => {
  const { lect_username } = req.body;
  db.query('SELECT l.lect_id, c.course_code FROM lecturers l LEFT JOIN courses c ON l.lect_id = c.lect_id WHERE l.lect_username = ?', [lect_username], (err, result) => {
    if (err) {
      console.error("Query Error", err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        const lect_id = result[0].lect_id;
        const courseCodes = result.map(row => row.course_code); // Extract course codes from each row
        res.json({ lect_id ,courseCodes, success: true });
      } else {
        res.status(401).json({ success: false, message: 'Lect Id not found' });
      }
    }
  });
});

//query for displaying the courses
app.post('/getCourses', (req, res) => {
  const { matric_num } = req.body;
  db.query('SELECT courses.course_name, course_code FROM courses JOIN users ON courses.matric_num = users.matric_num WHERE users.matric_num = ?', [matric_num], (err, result) => {
    if (err) {
      console.error("Query Error", err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        const courses = result.map(row => ({ course_name: row.course_name, course_code: row.course_code }));
        res.json({ courses, success: true });
      } else {
        res.status(401).json({ success: false, message: 'Matric Number not found' });
      }
    }
  });
});

app.post('/getLectCourses', (req, res) => {
  const { lect_id } = req.body;
  db.query('SELECT courses.course_name, course_code FROM courses JOIN lecturers ON courses.lect_id = lecturers.lect_id WHERE lecturers.lect_id = ?', [lect_id], (err, result) => {
    if (err) {
      console.error("Query Error", err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        const courses = result.map(row => ({ course_name: row.course_name, course_code: row.course_code }));
        res.json({ courses, success: true });
      } else {
        res.status(401).json({ success: false, message: 'Lecturers ID not found' });
      }
    }
  });
});

app.post('/attendance', async (req, res) => {  // to take attendance
  try {
    const { matric_num, course_id, status } = req.body;

    // Insert data into the Attendance table
    await db.query(
      'INSERT INTO attendance (matric_num, course_id, Status) VALUES (?, ?, "Present")',
      [matric_num, course_id, status]
    );

    console.log('Attendance record inserted successfully.');
    res.json({message:'Attendance record inserted successfully!'});
  } catch (error) {
    console.error('Error inserting attendance record:', error);
    res.status(500).send('Internal Server Error');
  }
});

// To get attendance records
app.post('/getAttendance', (req, res) => {
  const { matric_num } = req.body;

  const query = `
    SELECT
      a.attendanceID,
      a.matric_num,
      a.course_id,
      DATE_FORMAT(a.dateTaken, '%d-%m-%Y') AS dateTaken,
      TIME_FORMAT(a.timeTaken, '%H:%i') AS timeTaken,
      a.Status,
      c.course_code,
      c.course_name
    FROM
      attendance a
    INNER JOIN
      courses c ON a.course_id = c.course_id
    WHERE
      a.matric_num = ?;
  `;

  db.query(query, [matric_num], (err, result) => {
    if (err) {
      console.error("Query Error", err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        res.json({ records: result, success: true });
      } else {
        res.status(401).json({ success: false, message: 'No attendance records found for the specified matric_num' });
      }
    }
  });
});

app.post('/getLectCourses', (req, res) => {
  const { lect_id } = req.body;
  db.query('SELECT courses.course_name, course_code FROM courses JOIN lecturers ON courses.lect_id = lecturers.lect_id WHERE lecturers.lect_id = ?', [lect_id], (err, result) => {
    if (err) {
      console.error("Query Error", err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        const courses = result.map(row => ({ course_name: row.course_name, course_code: row.course_code }));
        res.json({ courses, success: true });
      } else {
        res.status(401).json({ success: false, message: 'Lecturers ID not found' });
      }
    }
  });
});

app.post('/attendance', async (req, res) => {  // to take attendance
  try {
    const { matric_num, course_id, status } = req.body;

    // Insert data into the Attendance table
    await db.query(
      'INSERT INTO attendance (matric_num, course_id, Status) VALUES (?, ?, ?)',
      [matric_num, course_id, status]
    );

    console.log('Attendance record inserted successfully.');
    res.json({message:'Attendance record inserted successfully!'});
  } catch (error) {
    console.error('Error inserting attendance record:', error);
    res.status(500).send('Internal Server Error');
  }
});

// To get attendance records
app.post('/getStudentsAttendance', (req, res) => {
  const { course_code } = req.body;

  const query = `
  SELECT c.course_name, 
  c.course_code, 
  c.course_id,
  u.matric_num,
  DATE_FORMAT(a.dateTaken, '%d-%m-%Y') AS dateTaken,
  TIME_FORMAT(a.timeTaken, '%H:%i') AS timeTaken, 
  a.status,
  a.attendanceID
FROM courses c
LEFT JOIN users u ON c.matric_num = u.matric_num
LEFT JOIN attendance a ON c.course_id = a.course_id
WHERE c.course_code IN (?) AND (u.matric_num IS NOT NULL OR c.lect_id IS NULL);
  `;

  db.query(query, [course_code], (err, result) => {
    if (err) {
      console.error("Query Error", err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      if (result.length > 0) {
        res.json({ records: result, success: true });
      } else {
        res.status(401).json({ success: false, message: 'No attendance records found for the specified course_code' });
      }
    }
  });
});

//To get the course_id for recording attendance
app.post('/getCourseId', (req, res) => {
  const { matric_num, course_code } = req.body;
  db.query('SELECT c.course_id FROM courses c INNER JOIN users u ON c.matric_num = u.matric_num WHERE c.course_code = ? AND u.matric_num = ?'
  , [ course_code, matric_num],(err, result) => {
    if (err) {
      console.error('Error executing the SELECT query:', err);
      res.status(500).send('Error retrieving data from the database');
    } else {
      res.json(result);
    }
  });
});

app.post('/absent',(req,res)=>{
  const {course_code} = req.body;
  db.query(`INSERT INTO attendance (matric_num, course_id, Status, timeTaken, dateTaken, course_code) 
            SELECT u.matric_num, c.course_id, 'Absent', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), ? 
            FROM courses AS c JOIN users AS u ON c.matric_num = u.matric_num 
            WHERE c.course_code = ?`
  ,[course_code, course_code],(err,result)=>{
    if (err) {
      console.error('Error executing the SELECT query:', err);
      res.status(500).send('Error retrieving data from the database');
    } else {
      res.json(result); 
    }
  });
});

// To update attendance status
app.post('/updateAttendance', (req, res) => {
  const { attendanceID, newStatus } = req.body;

  // Update the status in the database using the provided attendanceID
  const sql = 'UPDATE attendance SET status = ? WHERE attendanceID = ?';
  db.query(sql, [newStatus, attendanceID], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      res.status(500).send("Error updating status");
    } else {
      res.status(200).send("Status updated successfully");
    }
  });
});

//To validate password change
app.post('/passwordChange', (req, res) => {
  const { matric_num, password } = req.body; // Corrected variable name

  // Query the database for user authentication
  const query = `
  (SELECT 'user' as type, matric_num, password, username FROM users WHERE matric_num = ? AND password = ?)
   UNION 
  (SELECT 'lecturer' as type, lect_id as matric_num, lect_password, lect_username FROM lecturers WHERE lect_username = ? AND lect_password = ?)
  `;
  
  db.query(query, [matric_num, password, matric_num, password], (err, results) => { // Fixed parameter order
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } else {
      // Check if a user with matching credentials was found
      if (results.length > 0) {
        const user = results[0];
        res.json({ type: user.type, id: user.matric_num, password: user.password, username: user.username, success: true }); // Corrected response data
      } else {
        res.status(401).json({ success: false, message: 'Invalid matric_num or password' });
      }
    }
  });
});

app.post('/changedPassword', (req, res) => {
  const { data, password } = req.body;

  // Determine if the data is a matric_num or an id
  const isMatricNum = /^[0-9]{2}\/[0-9]{4}$/.test(data);
  const table = isMatricNum ? 'users' : 'lecturers';
  const column = isMatricNum ? 'matric_num' : 'lect_id';
  const newPassword = isMatricNum ? 'password' : 'lect_password';

  // Update the password in the respective table based on the received data
  const sql = `UPDATE ${table} SET ${newPassword} = ? WHERE ${column} = ?`;

  db.query(sql, [password, data], (err, result) => {
    if (err) {
      console.error("Error updating password:", err);
      res.status(500).send("Error updating password");
    } else {
      res.status(200).send("Password updated successfully");
    }
  });
});

//To set lecturers location
app.post('/updateLocation', (req, res) => {
  const { latitude, longitude, lect_id } = req.body;

  // Update the password in the respective table based on the received data
  const sql = `UPDATE lecturers SET latitude = ?, longitude = ? WHERE lect_id = ?`;

  db.query(sql, [latitude, longitude, lect_id], (err, result) => {
    if (err) {
      console.error("Error updating location:", err);
      res.status(500).send("Error updating location");
    } else {
      res.status(200).send("Location updated successfully");
    }
  });
});

//To get lecturers location
app.post('/getLocation', (req, res) => { 
  const { lect_id } = req.body;
  db.query('SELECT latitude,longitude FROM lecturers where lect_id = ?', (err, result) => {
    if (err) {
      console.error('Error executing the SELECT query:', err);
      res.status(500).send('Error retrieving data from the database');
    } else {
      res.json(result);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
