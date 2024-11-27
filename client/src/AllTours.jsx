import React, { useEffect, useState } from "react";
import VirtualTour from "./VirtualTour";

const AllTours = () => {
  const [tourData, setTourData] = useState([]);

  useEffect(() => {
    // Fetch data from the backend API
    fetch("http://localhost:5000/api/virtual-tour")
      .then((response) => response.json())
      .then((data) => {
        setTourData(data);
        console.log(data);
      })
      .catch((error) =>
        console.error("Error fetching virtual tour data:", error)
      );
  }, []);

  // Extract images and hotspots from the first object in the tourData
  const images = tourData.length > 0 ? tourData[0].images : [];
  console.log("images", images); ///
  const hotspots = tourData.length > 0 ? tourData[0].hotspots : [];
  console.log("hotspots", hotspots);
  return (
    <div>
      {images.length > 0 && hotspots.length > 0 ? (
        <VirtualTour images={images} hotspots={hotspots} />
      ) : (
        <p>Loading tour...</p>
      )}
    </div>
  );
};

export default AllTours;
