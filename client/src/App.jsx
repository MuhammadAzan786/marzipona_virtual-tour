import React from "react";
import UploadForm from "./UploadForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllTours from "./AllTours";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AllTours />} />
        <Route path="/uploadform" element={<UploadForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
