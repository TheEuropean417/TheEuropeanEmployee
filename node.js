const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Simple user data (In real production use a DB)
const users = [
  { id: 1, username: 'employee1', password: '$2b$10$E/ZcP...hashedPassword' }, // Hashed password
  { id: 2, username: 'employee2', password: '$2b$10$abcd1234...' }
];

passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find(u => u.username === username);
  if (!user) return done(null, false, { message: 'Incorrect username.' });
  bcrypt.compare(password, user.password, (err, res) => {
    if (res) return done(null, user);
    return done(null, false, { message: 'Incorrect password.' });
  });
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

app.use(session({ secret: 'yourSecret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => res.sendFile(__dirname + '/public/login.html'));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/employee-handbook', failureRedirect: '/' })
);

app.get('/employee-handbook', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.sendFile(__dirname + '/public/employee-handbook.html');
});

// Route to handle signing the document
app.post('/sign', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(403).send('Not authorized');
  const { signature } = req.body;

  // Load the PDF
  const pdfBytes = fs.readFileSync('public/handbook-template.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Edit the PDF
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  firstPage.drawText(signature, {
    x: 100,
    y: 100,
    size: 12,
  });

  // Save the signed PDF
  const signedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(`public/signed/${req.user.username}-signed.pdf`, signedPdfBytes);

  res.redirect('/employee-handbook');
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
