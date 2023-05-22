const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'your-database-name';
let db;

// Connect to MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }
  console.log('Connected to MongoDB');
  db = client.db(dbName);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Load Navbar
app.get('/navbar', (req, res) => {
  res.sendFile(__dirname + '/public/navbar.html');
});

// Sign In
app.post('/signin', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check email and password (you should implement your own authentication logic here)
  if (email === 'test@example.com' && password === 'password') {
    res.status(200).json({ status: 200 });
  } else {
    res.status(401).json({ status: 401, message: 'Invalid email or password' });
  }
});
// ...
// Upload Picture
app.post('/upload', (req, res) => {
    const imageFile = req.files.image;
    const description = req.body.description;
  
    // Process the uploaded image and description (you should implement your own logic here)
  
    // Assuming you have a MongoDB collection named 'gallery' to store the uploaded pictures
    const collection = db.collection('gallery');
    collection.insertOne({ imageUrl: 'path/to/image.jpg', description: description }, (err, result) => {
      if (err) {
        console.error('Error uploading picture:', err);
        res.status(500).json({ success: false });
      } else {
        res.status(200).json({ success: true });
      }
    });
  });
  
  // ...
  
// ...

// Load Avatar
app.get('/avatar', (req, res) => {
    // Retrieve the avatar URL from the server or database
    const avatarUrl = 'path/to/avatar.jpg';
  
    res.status(200).json({ success: true, avatarUrl });
  });
  
  // Load User Data
  app.get('/userdata', (req, res) => {
    // Retrieve the user data from the server or database
    const userData = {
      name: 'John Doe',
      breed: 'Labrador Retriever',
      description: 'I am a friendly dog.',
      links: ['link1', 'link2', 'link3']
    };
  
    res.status(200).json({ success: true, ...userData });
  });
  
  // Upload Avatar
  app.post('/uploadavatar', (req, res) => {
    const avatarFile = req.files.avatar;
  
    // Process the uploaded avatar (you should implement your own logic here)
  
    // Assuming you have stored the avatar URL in the database or server
    const avatarUrl = 'path/to/avatar.jpg';
  
    res.status(200).json({ success: true, avatarUrl });
  });
  
  // Save User Data
  app.post('/savedata', (req, res) => {
    const { name, breed, description, links } = req.body;
  
    // Process and save the user data (you should implement your own logic here)
  
    res.status(200).json({ success: true });
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
