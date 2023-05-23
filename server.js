  const express = require('express');
  const bodyParser = require('body-parser');
  const mongoose = require('mongoose');

  const app = express();
  const PORT = 3000;

  mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });
  const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    breed: String,
    email: String,
    password: String
  });
  
  const User = mongoose.model('User', userSchema);
  
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    const User = mongoose.model('User', {
      email: String,
      password: String
    });
    
    const newUser = new User({
      email,
      password
    });

    newUser.save((error) => {
      if (error) {
        console.error('Error occurred while saving user:', error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
      } else {
        res.status(200).json({ status: 200, message: 'Sign-in successful' });
      }
    });
  });
  app.post('/signup', (req, res) => {
    const { username, name, breed, email, password, repeatPassword } = req.body;

    if (!username || !name || !breed || !email || !password || !repeatPassword) {
      return res.status(400).json({ status: 400, message: 'All fields are required' });
    }

    if (password !== repeatPassword) {
      return res.status(400).json({ status: 400, message: 'Passwords do not match' });
    }

    const User = mongoose.model('User', {
      username: String,
      name: String,
      breed: String,
      email: String,
      password: String
    });

    User.findOne({ email }, (error, existingUser) => {
      if (error) {
        console.error('Error occurred while searching for existing user:', error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
      }

      if (existingUser) {
        return res.status(409).json({ status: 409, message: 'Email already exists' });
      }

      const newUser = new User({
        username,
        name,
        breed,
        email,
        password
      });

      newUser.save((error) => {
        if (error) {
          console.error('Error occurred while saving user:', error);
          return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }

        res.status(200).json({ status: 200, message: 'Sign-up successful' });
      });
    });
  });
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
