const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'your-database-name';
let db;

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }
  console.log('Connected to MongoDB');
  db = client.db(dbName);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/navbar', (req, res) => {
  res.sendFile(__dirname + '/public/navbar.html');
});


app.post('/signin', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === 'test@example.com' && password === 'password') {
    res.status(200).json({ status: 200 });
  } else {
    res.status(401).json({ status: 401, message: 'Invalid email or password' });
  }
});

app.post('/upload', (req, res) => {
    const imageFile = req.files.image;
    const description = req.body.description;
  
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
  
app.get('/avatar', (req, res) => {
    const avatarUrl = 'path/to/avatar.jpg';
  
    res.status(200).json({ success: true, avatarUrl });
  });
  
  app.get('/userdata', (req, res) => {
    const userData = {
      name: 'John Doe',
      breed: 'Labrador Retriever',
      description: 'I am a friendly dog.',
      links: ['link1', 'link2', 'link3']
    };
  
    res.status(200).json({ success: true, ...userData });
  });
  
  app.post('/uploadavatar', (req, res) => {
    const avatarFile = req.files.avatar;
    const avatarUrl = 'path/to/avatar.jpg';
  
    res.status(200).json({ success: true, avatarUrl });
  });
  
  app.post('/savedata', (req, res) => {
    const { name, breed, description, links } = req.body;
    res.status(200).json({ success: true });
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
