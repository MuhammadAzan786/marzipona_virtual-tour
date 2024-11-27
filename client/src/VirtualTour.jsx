import React, { useState, useEffect } from "react";
import Marzipano from "marzipano";
import { ImageList, ImageListItem, Box, Typography } from "@mui/material";

const VirtualTour = ({ images, hotspots }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (selectedImage) {
      const viewerElement = document.querySelector("#pano");

      // Log when the viewer is being reinitialized
      console.log(
        "Initializing viewer for selected image:",
        selectedImage.name
      );
      console.log("selectedImage", selectedImage);

      // Destroy previous viewer instance if it exists
      if (viewer) {
        console.log("Destroying previous viewer instance.");
        viewer.destroy();
      }

      // Create a new viewer instance
      const viewerInstance = new Marzipano.Viewer(viewerElement);

      // Check if selectedImage.file exists
      if (selectedImage.url) {
        console.log("Creating image:", selectedImage.url);
        const source = Marzipano.ImageUrlSource.fromString(selectedImage.url);
        const geometry = new Marzipano.EquirectGeometry([{ tileSize: 512 }]);
        const view = new Marzipano.RectilinearView({
          yaw: 0,
          pitch: 0,
          fov: Math.PI / 2,
        });

        const scene = viewerInstance.createScene({ source, geometry, view });
        console.log("Scene created:", scene);
        scene.switchTo();

        // Get hotspots for the selected image
        const imageHotspots = hotspots.find(
          (hotspot) => hotspot.imageUrl === selectedImage.url
        );

        console.log("Hotspots for selected image:", imageHotspots);

        imageHotspots.hotspots.forEach((hotspot) => {
          const hotspotElement = document.createElement("div");
          hotspotElement.classList.add("hotspot");
          hotspotElement.style.width = "20px";
          hotspotElement.style.height = "20px";
          hotspotElement.style.backgroundColor = "red";
          hotspotElement.style.borderRadius = "50%";
          hotspotElement.style.cursor = "pointer";

          hotspotElement.addEventListener("click", () => {
            console.log("Hotspot clicked:", hotspot);
            const targetImage = images.find(
              (img) => img.name === hotspot.targetImage
            );
            if (targetImage) {
              console.log("Target image found:", targetImage.name);
              setSelectedImage(targetImage);
            } else {
              console.log(
                "Target image not found for hotspot:",
                hotspot.targetImage
              );
            }
          });

          scene.hotspotContainer().createHotspot(hotspotElement, {
            yaw: hotspot.yaw,
            pitch: hotspot.pitch,
          });
        });

        setViewer(viewerInstance);
      } else {
        console.error("No file found for selected image:", selectedImage);
      }
    }
  }, [selectedImage, hotspots]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Virtual Tour
      </Typography>
      <ImageList cols={4} rowHeight={150}>
        {images.map((image, index) => (
          <ImageListItem
            key={index}
            onClick={() => {
              console.log("Image clicked:", image.name);
              setSelectedImage(image);
            }}
            sx={{
              cursor: "pointer",
              border: selectedImage === image ? "3px solid #1976d2" : "none",
              borderRadius: "5px",
              overflow: "hidden",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <img
              src={image.url}
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

      {selectedImage && (
        <Box
          id="pano"
          sx={{
            width: "100%",
            height: "500px",
            position: "relative",
            overflow: "hidden",
            margin: "20px auto",
            border: "1px solid #1976d2",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f7f7f7",
          }}
        />
      )}
    </Box>
  );
};

export default VirtualTour;
