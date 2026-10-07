import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Presentations from "./Pages/Presentations";
import CreateZip from "./Pages/CreateZip";
import CreatePresentation from "./Pages/CreatePresentation";
import CreateVideo from "./Pages/CreateVideo";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-zip" element={<CreateZip />} />
        <Route path="/presentations" element={<Presentations />} />
        <Route path="/urlForm" element={<CreatePresentation />} />
        <Route path="/create-video" element={<CreateVideo />} />
        





      </Routes>
      
    </>
  );
}

export default App;
