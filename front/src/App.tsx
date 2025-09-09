import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/HomeComps/Home";
import Register from "./Register";
import Login from "./Login";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
