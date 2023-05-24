const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const session = require('express-session');
const sharp = require('sharp');
const fs = require('fs/promises');

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
  description: { type: String },
  password: { type: String, required: true },
  avatar: { type: String }
});

const User = mongoose.model('pets', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use('/public', express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/signup', async (req, res) => {
  try {
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

    await newUser.save();
    res.status(200).json({ status: 200, message: 'Sign-up successful' });
  } catch (error) {
    console.error('Error occurred while saving user:', error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

app.post('/signin', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error occurred while signing in:', error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

app.get('/profile', async (req, res) => {
  try {
    const userData = await User.findOne({});
    res.json(userData);
  } catch (error) {
    console.error('Error occurred while retrieving user data:', error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

app.post('/profile', async (req, res) => {
  try {
    const { name, breed, description } = req.body;

    await User.findOneAndUpdate({}, { name, breed, description });
    res.status(200).json({ status: 200, message: 'User data saved successfully' });
  } catch (error) {
    console.error('Error occurred while saving user data:', error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

app.post('/avatars', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const avatarFilePath = req.file.path;
    const buffer = await sharp(avatarFilePath)
      .resize(50, 50)
      .toBuffer();

    const resizedAvatarFilePath = `./uploads/resized_${req.file.filename}`;
    await fs.writeFile(resizedAvatarFilePath, buffer);

    const avatarFileName = `resized_${req.file.filename}`;
    const userEmail = req.body.email;

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { avatar: avatarFileName },
      { new: true }
    );

    req.session.body = updatedUser;

    await fs.unlink(avatarFilePath);

    res.status(200).send('Avatar saved successfully.');
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    res.status(500).send('Failed to upload avatar.');
  }
});

app.get('/gallery', async (req, res) => {
  try {
    const collection = db.collection('gallery');
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error('Error loading gallery:', error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

app.post('/upload', upload.single('image'), (req, res) => {
  const { description } = req.body;
  const imagePath = req.file.path;
  const imageUrl = '/posts/' + req.file.filename;

  const collection = db.collection('photos');

  collection
    .insertOne({ imageUrl, description })
    .then(() => {
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error uploading image:', error);
      res.json({ success: false });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
