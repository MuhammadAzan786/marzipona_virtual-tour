import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import { Typography, Box, Container, Button } from "@mui/material";

function AllTours() {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [panorama, setPanorama] = useState(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tours");
        setTours(res.data);
        if (res.data.length > 0) {
          loadTour(res.data[0]);
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();
  }, []);

  const loadTour = (tour) => {
    setSelectedTour(tour);
    if (viewerRef.current) {
      viewerRef.current.dispose();
    }

    const newViewer = new PANOLENS.Viewer({
      container: document.querySelector("#panorama-container"),
      controlBar: true,
      output: "console",
    });

    const newPanorama = new PANOLENS.ImagePanorama(
      `http://localhost:5000/${tour.images[0]}`
    );

    tour.hotspots.forEach((hotspot) => {
      const spot = new PANOLENS.Infospot(350, PANOLENS.DataImage.Info);
      spot.position.set(hotspot.x, hotspot.y, hotspot.z);
      spot.addHoverText(hotspot.name);
      spot.addEventListener("click", () => {
        const nextTour = tours.find((t) => t._id === hotspot.roomId);
        if (nextTour) {
          loadTour(nextTour);
        }
      });
      newPanorama.add(spot);
    });

    newViewer.add(newPanorama);
    newPanorama.load();
    setPanorama(newPanorama);
    viewerRef.current = newViewer;
  };

  const switchImage = (image) => {
    if (panorama) {
      panorama.dispose();
      const newPanorama = new PANOLENS.ImagePanorama(
        `http://localhost:5000/${image}`
      );
      viewerRef.current.add(newPanorama);
      newPanorama.load();
      setPanorama(newPanorama);
    }
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Virtual Tours
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
        {tours.map((tour) => (
          <Button
            key={tour._id}
            variant="contained"
            color="primary"
            onClick={() => loadTour(tour)}
            sx={{ textTransform: "none" }}
          >
            {tour.name}
          </Button>
        ))}
      </Box>
      <Box
        id="panorama-container"
        sx={{
          position: "relative",
          width: "100%",
          height: "500px",
          maxWidth: "800px",
          margin: "0 auto",
          border: "2px solid #1976d2",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#f7f7f7",
          overflow: "hidden",
        }}
      />
      {selectedTour && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          {selectedTour.images.map((image, index) => (
            <Box
              key={index}
              sx={{
                width: "100px",
                height: "60px",
                margin: "0 10px",
                cursor: "pointer",
                backgroundImage: `url(http://localhost:5000/${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border:
                  image === panorama ? "3px solid #1976d2" : "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => switchImage(image)}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}

export default AllTours;
