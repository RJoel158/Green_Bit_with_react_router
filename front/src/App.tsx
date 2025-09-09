import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/HomeComps/Home";
import Register from "./Register";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
