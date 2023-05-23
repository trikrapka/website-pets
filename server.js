const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  breed: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors()); 

app.post('/signup', (req, res) => {
  const { username, name, breed, email, password, repeatPassword } = req.body;

  if (!username || !name || !breed || !email || !password || !repeatPassword) {
    return res.status(400).json({ status: 400, message: 'All fields are required' });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ status: 400, message: 'Passwords do not match' });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});