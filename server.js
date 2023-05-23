const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/db', {
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

const User = mongoose.model('pets', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post('/signup', async (req, res) => {
  const { username, name, breed, email, password, repeatPassword } = req.body;

  if (!username || !name || !breed || !email || !password || !repeatPassword) {
    return res.status(400).json({ status: 405, message: 'All fields are required' });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ status: 405, message: 'Passwords do not match' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    name,
    breed,
    email,
    password: hashedPassword
  });

  newUser.save()
  .then(() => {
    res.status(200).json({ status: 200, message: 'Sign-up successful' });
  })
  .catch((error) => {
    console.error('Error occurred while saving user:', error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  });
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ status: 401, message: 'Invalid email or password' });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ status: 401, message: 'Invalid email or password' });
  }

  res.status(200).json({ status: 200, message: 'Login successful' });
});


app.get('/profile', (req, res) => {
  // Retrieve user data from the database
  User.findOne({})
    .then(userData => {
      res.json(userData);
    })
    .catch(err => {
      console.error('Error occurred while retrieving user data:', err);
      res.status(500).json({ status: 500, message: 'Internal Server Error' });
    });
});

app.post('/profile', (req, res) => {
  const { name, breed, description } = req.body;

  // Update user data in the database
  User.findOneAndUpdate({}, { name, breed, description })
    .then(() => {
      res.status(200).json({ status: 200, message: 'User data saved successfully' });
    })
    .catch(err => {
      console.error('Error occurred while saving user data:', err);
      res.status(500).json({ status: 500, message: 'Internal Server Error' });
    });
});

app.post('/avatar', (req, res) => {
  // Save avatar logic
  // You need to implement this part based on your requirements for saving the avatar

  // Assuming the avatar is saved successfully
  res.status(200).json({ status: 200, message: 'Avatar saved successfully' });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
