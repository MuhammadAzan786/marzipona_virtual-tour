const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const app = express();
const cors = require("cors");
const cloudinary = require("./cloudinary");
const upload = require("./upload");
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

const hotspotSchema = new mongoose.Schema({
  pitch: { type: Number, required: true },
  yaw: { type: Number, required: true },
  roomId: { type: String, required: true },
  description: { type: String, required: true },
  targetImage: { type: String, required: true },
});

const imageHotspotsSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  hotspots: [hotspotSchema],
});

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
});

const formDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [fileSchema],
  hotspots: [
    {
      type: imageHotspotsSchema,
      required: true,
    },
  ],
});

const VirtualTourData = mongoose.model("VirtualTourData", formDataSchema);

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
  })
);

app.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    // Extract name and hotspots
    const { name, hotspots } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Upload files to Cloudinary
    const imageUploads = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "virtual_tour" },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                name: file.originalname,
                url: result.secure_url,
                size: file.size,
                type: file.mimetype,
              });
            }
          );
          uploadStream.end(file.buffer);
        });
      })
    );

    // Parse hotspots JSON
    const parsedHotspots = JSON.parse(hotspots);

    // Map hotspots to uploaded images
    const mappedHotspots = Object.entries(parsedHotspots).map(
      ([imageName, hs]) => {
        const imageUrl = imageUploads.find(
          (img) => img.name === imageName
        )?.url;
        if (!imageUrl) {
          throw new Error(`Image URL not found for: ${imageName}`);
        }
        return { imageUrl, hotspots: hs };
      }
    );

    // Form data to save
    const formData = {
      name,
      images: imageUploads,
      hotspots: mappedHotspots,
    };

    // Save to database
    const savedData = await VirtualTourData.create(formData);
    res
      .status(200)
      .json({ message: "Data saved successfully!", data: savedData });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({
      message: "Failed to save data",
      error: error.message || "Unknown error",
    });
  }
});

app.get("/api/virtual-tour", async (req, res) => {
  try {
    const tourData = await VirtualTourData.find({});
    res.json(tourData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch virtual tour data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
