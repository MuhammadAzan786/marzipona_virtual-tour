import React, { useState, useEffect } from "react";
import axios from "axios";
import Marzipano from "marzipano";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Box,
  ImageList,
  ImageListItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import Loading from "./Loading";

const UploadForm = () => {
  const [tourName, setTourName] = useState("");
  const [images, setImages] = useState([]);
  const [hotspots, setHotspots] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentHotspot, setCurrentHotspot] = useState({
    pitch: "",
    yaw: "",
    roomId: "",
    description: "",
    targetImage: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (selectedImage) {
      const viewerElement = document.querySelector("#pano");

      // Destroy previous viewer instance
      if (viewer) {
        viewer.destroy();
      }

      const viewerInstance = new Marzipano.Viewer(viewerElement);
      const source = Marzipano.ImageUrlSource.fromString(
        URL.createObjectURL(selectedImage.file)
      );
      const geometry = new Marzipano.EquirectGeometry([{ tileSize: 512 }]);
      const view = new Marzipano.RectilinearView({
        yaw: 0,
        pitch: 0,
        fov: Math.PI / 2,
      });

      const scene = viewerInstance.createScene({ source, geometry, view });
      scene.switchTo();

      // Get hotspots for the selected image
      const imageHotspots = hotspots[selectedImage.name] || [];
      imageHotspots.forEach((hotspot) => {
        const hotspotElement = document.createElement("div");
        hotspotElement.classList.add("hotspot");
        hotspotElement.style.width = "20px";
        hotspotElement.style.height = "20px";
        hotspotElement.style.backgroundColor = "red";
        hotspotElement.style.borderRadius = "50%";
        hotspotElement.style.cursor = "pointer";

        hotspotElement.addEventListener("click", () => {
          const targetImage = images.find(
            (img) => img.name === hotspot.targetImage
          );
          console.log(targetImage);
          if (targetImage) {
            setSelectedImage(targetImage);
          }
        });

        scene.hotspotContainer().createHotspot(hotspotElement, {
          yaw: hotspot.yaw,
          pitch: hotspot.pitch,
        });
      });

      setViewer(viewerInstance);
    }
  }, [selectedImage, hotspots]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).map((file, index) => ({
      file,
      name: file.name || `Image ${index + 1}`,
    }));
    setImages(files);
    if (files.length > 0) {
      setSelectedImage(files[0]);
    }
  };

  const handleHotspotChange = (e) => {
    const { name, value } = e.target;
    setCurrentHotspot({
      ...currentHotspot,
      [name]: value,
    });
  };

  const handleImageClick = (e) => {
    if (viewer) {
      const clickPosition = viewer
        .view()
        .screenToCoordinates({ x: e.clientX, y: e.clientY });
      setCurrentHotspot({
        ...currentHotspot,
        pitch: clickPosition.pitch,
        yaw: clickPosition.yaw,
      });
    }
  };

  const addHotspot = () => {
    if (!selectedImage) return;

    setHotspots((prevHotspots) => ({
      ...prevHotspots,
      [selectedImage.name]: [
        ...(prevHotspots[selectedImage.name] || []),
        currentHotspot,
      ],
    }));

    setCurrentHotspot({
      pitch: "",
      yaw: "",
      roomId: "",
      description: "",
      targetImage: "",
    });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", tourName);
    images.forEach((image) => {
      formData.append("images", image.file);
    });
    formData.append("hotspots", JSON.stringify(hotspots));
    console.log("form data", ...formData);
    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(false);
      console.log(res.data);
      alert("Tour created successfully!");
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Failed to create tour.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create a Virtual Tour
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tour Name"
                variant="outlined"
                value={tourName}
                onChange={(e) => setTourName(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" component="label">
                Upload Images
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                  hidden
                  required
                />
              </Button>
            </Grid>

            {images.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Set Names for Images
                </Typography>
                <Grid container spacing={2}>
                  {images.map((image, index) => (
                    <Grid item xs={12} key={index}>
                      <Box display="flex" alignItems="center">
                        <Typography sx={{ flex: "0 0 50px" }}>
                          {index + 1}.
                        </Typography>
                        <TextField
                          label="Image Name"
                          value={image.name}
                          onChange={(e) => {
                            const newImages = [...images];
                            newImages[index].name = e.target.value;
                            setImages(newImages);
                          }}
                          fullWidth
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            {images.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Select an Image to Add Hotspots
                </Typography>
                <ImageList cols={4} rowHeight={150}>
                  {images.map((image, index) => (
                    <ImageListItem
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      sx={{
                        cursor: "pointer",
                        border:
                          selectedImage === image
                            ? "3px solid #1976d2"
                            : "none",
                        borderRadius: "5px",
                        overflow: "hidden",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <img
                        src={URL.createObjectURL(image.file)}
                        alt={`Image ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Grid>
            )}

            {selectedImage && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Click on the Image to Set a Hotspot
                </Typography>
                <Box
                  id="pano"
                  onClick={handleImageClick}
                  sx={{
                    width: "100%",
                    height: "500px",
                    position: "relative",
                    overflow: "hidden",
                    margin: "0 auto",
                    border: "1px solid #1976d2",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#f7f7f7",
                  }}
                />
              </Grid>
            )}

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Pitch"
                name="pitch"
                variant="outlined"
                value={currentHotspot.pitch}
                onChange={handleHotspotChange}
                InputProps={{ readOnly: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Yaw"
                name="yaw"
                variant="outlined"
                value={currentHotspot.yaw}
                onChange={handleHotspotChange}
                InputProps={{ readOnly: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room ID"
                name="roomId"
                variant="outlined"
                value={currentHotspot.roomId}
                onChange={handleHotspotChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                variant="outlined"
                value={currentHotspot.description}
                onChange={handleHotspotChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target Image"
                name="targetImage"
                variant="outlined"
                value={currentHotspot.targetImage}
                onChange={handleHotspotChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={addHotspot}
                disabled={!selectedImage}
              >
                Add Hotspot
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" type="submit" color="secondary">
                Create Tour
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      {loading && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress />
        </Backdrop>
      )}
    </Box>
  );
};

export default UploadForm;
