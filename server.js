const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const session = require("express-session");
const sharp = require("sharp");
const fs = require("fs/promises");

const app = express();
const PORT = 3000;
const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://localhost:27017/db";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  breed: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  description: { type: String },
  password: { type: String, required: true },
  gender: { type: String },
  type: { type: String },
  avatar: { type: String },
});

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String, required: true },
});

const commentSchema = new mongoose.Schema({
  content: String,
  author: String,
});

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Comment = mongoose.model('Comment', commentSchema);

const db = client.db();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/public", express.static("public"));
app.use("/uploads", express.static("uploads")); 


// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/signup", async (req, res) => {
  try {
    const { username, name, breed, email, password, repeatPassword, avatar } =
      req.body;

    if (
      !username ||
      !name ||
      !breed ||
      !email ||
      !password ||
      !repeatPassword
    ) {
      return res
        .status(400)
        .json({ status: 405, message: "All fields are required" });
    }

    if (password !== repeatPassword) {
      return res
        .status(400)
        .json({ status: 405, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: 405, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId: new mongoose.Types.ObjectId().toString(),
      username,
      name,
      breed,
      email,
      password: hashedPassword,
      avatar,
    });

    await newUser.save();
    res.status(200).json({ status: 200, message: "Sign-up successful" });
  } catch (error) {
    console.error("Error occurred while saving user:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email or password" });
    }

    // user ID sessin
    req.session.userId = user.userId;

    res.status(200).json({ status: 200, message: "Login successful" });
  } catch (error) {
    console.error("Error occurred while signing in:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.get("/profile", async (req, res) => {
  try {
    const { userId } = req.session;

    const userData = await User.findOne({ userId });
    if (!userData) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    res.json(userData);
  } catch (error) {
    console.error("Error occurred while retrieving user data:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.post("/profile", async (req, res) => {
  try {
    const { name, breed, description } = req.body;
    const { userId } = req.session;

    await User.findOneAndUpdate({ userId }, { name, breed, description });
    res
      .status(200)
      .json({ status: 200, message: "User data saved successfully" });
  } catch (error) {
    console.error("Error occurred while saving user data:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});
app.use(express.static("uploads"));
app.get("/avatars/:filename", (req, res) => {
  const filename = req.params.filename;
  const avatarPath = `./uploads/resized_${filename}`;

  fs.readFile(avatarPath, (error, data) => {
    if (error) {
      console.error("Failed to read avatar file:", error);
      res.status(500).send("Failed to load avatar.");
    } else {
      res.set("Content-Type", "image/jpeg");
      res.send(data);
    }
  });
});

app.post("/avatars", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const avatarFilePath = req.file.path;
    const buffer = await sharp(avatarFilePath).resize(50, 50).toBuffer();

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

    res.status(200).send("Avatar saved successfully.");
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    res.status(500).send("Failed to upload avatar.");
  }
});

app.use("/uploads", express.static("uploads"));

app.post("/gallery", upload.single("image"), (req, res) => {
  const { description } = req.body;
  const imagePath = req.file.path;
  const imageUrl = "/uploads/" + req.file.filename;

  const collection = db.collection("photos");

  collection
    .insertOne({ imageUrl, description })
    .then(() => {
      res.json({ success: true, imageUrl, description });
    })
    .catch((error) => {
      console.error("Error uploading image:", error);
      res.json({ success: false, error: "Failed to upload image" });
    });
});

app.get("/gallery", (req, res) => {
  const collection = db.collection("photos");

  collection
    .find()
    .toArray()
    .then((galleryData) => {
      res.json(galleryData);
    })
    .catch((error) => {
      console.error("Error loading gallery:", error);
      res.status(500).json({ error: "Failed to load gallery" });
    });
});

app.post("/signinadmin", async (req, res) => {
  try {
    const { username, password } = req.path;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid username or password" });
    }

    req.session.adminId = admin.adminId;

    res.status(200).json({ status: 200, message: "Login successful" });
  } catch (error) {
    console.error("Error occurred while signing in:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.post("/comments", function (req, res) {
  var commentData = {
    content: req.body.content,
    author: req.body.author,
  };

  Comment.create(commentData, function (err, comment) {
    if (err) {
      console.error("Error saving comment:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to save comment." });
    } else {
      res.status(200).json({ success: true, comment: comment });
    }
  });
});

app.delete("/gallery", async (req, res) => {
  const imageUrl = req.body.imageUrl;

  const signedInAsAdmin = true;

  if (!signedInAsAdmin) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const image = await Image.findOne({ imageUrl });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }
    const imagePath = path.join(__dirname, "uploads", image.filename);
    fs.unlinkSync(imagePath);
    await image.remove();

    return res
      .status(200)
      .json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete image" });
  }
});

app.post('/comments', (req, res) => {
  const { content, author } = req.body;

  const newComment = new Comment({
    content,
    author,
  });

  newComment.save()
    .then((comment) => {
      console.log('Comment saved:', comment);
      res.status(200).json({ success: true, comment });
    })
    .catch((error) => {
      console.error('Error saving comment:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
