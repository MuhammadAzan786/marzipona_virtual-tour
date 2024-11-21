const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const app = express();
const cors = require("cors");
// Connect to MongoDB
const DB_Connection = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/virtual_tour")
    .then(() => {
      console.log("mongo db connected");
    })
    .catch((error) => {
      console.log(error);
    });
};

DB_Connection();

const tourSchema = new mongoose.Schema({
  name: String,
  images: [String],
  hotspots: [
    {
      pitch: Number,
      yaw: Number,
      roomId: String,
      description: String,
    },
  ],
});

const Tour = mongoose.model("Tour", tourSchema);

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
  })
);

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Create a new virtual tour
app.post("/api/tours", upload.array("images"), async (req, res) => {
  try {
    const { name, hotspots } = req.body;
    const imagePaths = req.files.map((file) => file.path);

    const newTour = new Tour({
      name,
      images: imagePaths,
      hotspots: JSON.parse(hotspots),
    });

    await newTour.save();
    res.status(201).json({ message: "Tour created successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tours
app.get("/api/tours", async (req, res) => {
  try {
    const tours = await Tour.find();
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files (images)
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
