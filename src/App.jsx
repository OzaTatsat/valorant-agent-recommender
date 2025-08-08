import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainAgentSelector from "./components/MainAgentSelector";
import RecommendationPage from "./components/RecommendationPage";
import "./styles/global.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainAgentSelector />} />
        <Route path="/recommendation" element={<RecommendationPage />} />
      </Routes>
    </Router>
  );
};

export default App;
